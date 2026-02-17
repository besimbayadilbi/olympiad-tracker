-- Схема базы данных для Supabase
-- Запустите этот SQL в Supabase SQL Editor

-- Пользователи (расширение auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'parent')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ученики
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  textbook TEXT,
  color TEXT DEFAULT '#2E5D8A',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Расписание
CREATE TABLE public.schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time TEXT NOT NULL,
  lesson_type TEXT DEFAULT 'regular'
);

-- Поурочный план
CREATE TABLE public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  date DATE NOT NULL,
  day_label TEXT,
  topic TEXT NOT NULL,
  source TEXT,
  olympiad_tasks TEXT,
  homework TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'missed', 'rescheduled')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Результаты уроков
CREATE TABLE public.lesson_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_plan_id UUID REFERENCES public.lesson_plans(id),
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  understanding INTEGER CHECK (understanding BETWEEN 1 AND 5),
  tasks_solved INTEGER DEFAULT 0,
  tasks_correct INTEGER DEFAULT 0,
  speed_min INTEGER,
  weak_areas TEXT[] DEFAULT '{}',
  strong_areas TEXT[] DEFAULT '{}',
  homework_given TEXT,
  homework_done TEXT DEFAULT 'done' CHECK (homework_done IN ('done', 'partial', 'not_done')),
  teacher_comment_private TEXT,
  teacher_comment_parent TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- База знаний
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  topic TEXT NOT NULL,
  grade_4_level TEXT,
  grade_5_level TEXT,
  kangourou_importance INTEGER DEFAULT 1 CHECK (kangourou_importance BETWEEN 1 AND 3),
  femo_importance INTEGER DEFAULT 1 CHECK (femo_importance BETWEEN 1 AND 3)
);

-- Олимпиадные события
CREATE TABLE public.olympiad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('kangourou', 'femo')),
  description TEXT
);

-- Результаты пробных олимпиад
CREATE TABLE public.mock_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  olympiad_event_id UUID REFERENCES public.olympiad_events(id),
  date DATE NOT NULL,
  format TEXT,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  time_min INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Еженедельные отчёты
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  week_start DATE,
  week_end DATE,
  topics_covered TEXT[] DEFAULT '{}',
  tasks_solved INTEGER DEFAULT 0,
  tasks_correct INTEGER DEFAULT 0,
  homework_done BOOLEAN DEFAULT true,
  good_feedback TEXT,
  work_on_feedback TEXT,
  readiness INTEGER DEFAULT 1 CHECK (readiness BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Сообщения
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.users(id),
  to_user_id UUID REFERENCES public.users(id),
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === Row Level Security ===

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olympiad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Учитель: полный доступ
CREATE POLICY "teacher_all" ON public.students FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.schedule FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.lesson_plans FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.lesson_results FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.knowledge_base FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.olympiad_events FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.mock_results FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.weekly_reports FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "teacher_all" ON public.messages FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'teacher');

-- Родитель: только чтение определённых таблиц
CREATE POLICY "parent_read_students" ON public.students FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'parent');

CREATE POLICY "parent_read_schedule" ON public.schedule FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'parent');

CREATE POLICY "parent_read_results" ON public.lesson_results FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'parent');

CREATE POLICY "parent_read_reports" ON public.weekly_reports FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'parent');

CREATE POLICY "parent_read_events" ON public.olympiad_events FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'parent');

CREATE POLICY "parent_messages" ON public.messages FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'parent'
    AND (from_user_id = auth.uid() OR to_user_id = auth.uid())
  );
