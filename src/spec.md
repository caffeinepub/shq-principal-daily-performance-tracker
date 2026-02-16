# Specification

## Summary
**Goal:** Limit KPI Daily Activities to 5 configurable items by removing “Teacher Attendance Check” from all KPI Daily Activity UI surfaces, while allowing Admin and Director to edit the remaining configuration and keeping submissions compatible with the existing backend format.

**Planned changes:**
- Remove “Teacher Attendance Check” from all user-facing KPI Daily Activity displays (Daily Activity Form, KPI preview/badges, Monitoring KPI table, KPI weights card) so exactly 5 items/columns/rows are shown and no UI text references it.
- Adjust Daily Activity submission/reset behavior to remain compatible with the existing backend submission type while ensuring the removed activity is always submitted as a neutral/disabled value and does not affect KPI previews.
- Add/enable KPI Daily Activity configuration editing for Admin and Director roles (with save flow), while keeping other roles view-only and surfacing authorization errors in English.
- Enforce the 5-item limit in configuration and calculations: validate totals across only the 5 visible weights (=100), and ensure the removed activity’s weight/contribution is forced to 0 when saving and when computing KPI previews/badges/tables.

**User-visible outcome:** Users see only 5 KPI Daily Activities everywhere (no “Teacher Attendance Check” anywhere). Admins and Directors can edit and save the 5-item KPI activity/weights configuration; other users can only view it. Daily Activity submissions continue to work without the removed item affecting results.
