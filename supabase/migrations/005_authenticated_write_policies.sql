-- =============================================
-- Authenticated (admin) write policies for ALL tables
-- Run this in Supabase SQL Editor
-- =============================================

-- EXAMS
create policy "Authenticated can insert exams"
  on exams for insert to authenticated with check (true);
create policy "Authenticated can update exams"
  on exams for update to authenticated using (true) with check (true);
create policy "Authenticated can delete exams"
  on exams for delete to authenticated using (true);
create policy "Authenticated can read all exams"
  on exams for select to authenticated using (true);

-- NOTIFICATIONS
create policy "Authenticated can insert notifications"
  on notifications for insert to authenticated with check (true);
create policy "Authenticated can update notifications"
  on notifications for update to authenticated using (true) with check (true);
create policy "Authenticated can delete notifications"
  on notifications for delete to authenticated using (true);
create policy "Authenticated can read all notifications"
  on notifications for select to authenticated using (true);

-- PAPERS
create policy "Authenticated can insert papers"
  on papers for insert to authenticated with check (true);
create policy "Authenticated can update papers"
  on papers for update to authenticated using (true) with check (true);
create policy "Authenticated can delete papers"
  on papers for delete to authenticated using (true);
create policy "Authenticated can read all papers"
  on papers for select to authenticated using (true);

-- CUTOFFS
create policy "Authenticated can insert cutoffs"
  on cutoffs for insert to authenticated with check (true);
create policy "Authenticated can update cutoffs"
  on cutoffs for update to authenticated using (true) with check (true);
create policy "Authenticated can delete cutoffs"
  on cutoffs for delete to authenticated using (true);

-- SYLLABUS SECTIONS
create policy "Authenticated can insert syllabus_sections"
  on syllabus_sections for insert to authenticated with check (true);
create policy "Authenticated can update syllabus_sections"
  on syllabus_sections for update to authenticated using (true) with check (true);
create policy "Authenticated can delete syllabus_sections"
  on syllabus_sections for delete to authenticated using (true);

-- EXAM DATES
create policy "Authenticated can insert exam_dates"
  on exam_dates for insert to authenticated with check (true);
create policy "Authenticated can update exam_dates"
  on exam_dates for update to authenticated using (true) with check (true);
create policy "Authenticated can delete exam_dates"
  on exam_dates for delete to authenticated using (true);

-- BUNDLES
create policy "Authenticated can insert bundles"
  on bundles for insert to authenticated with check (true);
create policy "Authenticated can update bundles"
  on bundles for update to authenticated using (true) with check (true);
create policy "Authenticated can delete bundles"
  on bundles for delete to authenticated using (true);
create policy "Authenticated can read all bundles"
  on bundles for select to authenticated using (true);

-- BUNDLE FILES
create policy "Authenticated can insert bundle_files"
  on bundle_files for insert to authenticated with check (true);
create policy "Authenticated can update bundle_files"
  on bundle_files for update to authenticated using (true) with check (true);
create policy "Authenticated can delete bundle_files"
  on bundle_files for delete to authenticated using (true);

-- ORDERS
create policy "Authenticated can read orders"
  on orders for select to authenticated using (true);
create policy "Authenticated can insert orders"
  on orders for insert to authenticated with check (true);
create policy "Authenticated can update orders"
  on orders for update to authenticated using (true) with check (true);

-- COUPONS
create policy "Authenticated can read coupons"
  on coupons for select to authenticated using (true);
create policy "Authenticated can insert coupons"
  on coupons for insert to authenticated with check (true);
create policy "Authenticated can update coupons"
  on coupons for update to authenticated using (true) with check (true);
create policy "Authenticated can delete coupons"
  on coupons for delete to authenticated using (true);
