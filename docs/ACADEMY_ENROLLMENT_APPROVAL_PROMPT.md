# Prompt: Academy Enrollment Approval Process

Use this prompt when implementing the **academy approval workflow** in your **web dashboard** and **API** projects. The mobile app already submits enrollments via `POST /api/academy/:academyId/enroll`; the backend and dashboard must support storing, listing, and approving/rejecting those enrollments.

---

## Context

- **Mobile app**: Dancers submit enrollment requests to an academy (full name, phone, email, ID number, payment voucher image). Request is sent to `POST /api/academy/:academyId/enroll`.
- **Backend**: Must persist enrollments with a status (e.g. `pending`), associate them with the academy and the user, and expose endpoints for the academy to list and approve/reject.
- **Web dashboard**: Academy owners/admins log in, see a list of pending enrollments for their academy, and can approve or reject each one. Optionally they can view enrollment details (applicant info, voucher image) before deciding.

---

## API Project – Requirements

Implement the following in your API (Node/Express, Nest, or equivalent).

### 1. Data model

- **Enrollment** (or equivalent collection/table) with at least:
  - `id` (or `_id`)
  - `academyId` – academy the user is enrolling in
  - `userId` – id of the dancer (from auth token when submitting)
  - `fullName`, `phone`, `email`, `idNumber` – from enrollment form
  - `voucherImage` – stored URL or base64/reference (file storage recommended)
  - `status` – `"pending"` | `"approved"` | `"rejected"`
  - `createdAt`, `updatedAt`
  - Optional: `reviewedAt`, `reviewedBy` (academy user id)
- **Uniqueness**: One active enrollment per user per academy (e.g. one `pending` or `approved` per `userId` + `academyId`). Reject or return 409 when duplicate.

### 2. Existing enrollment submission (mobile app)

- **Endpoint**: `POST /api/academy/:academyId/enroll`
- **Auth**: Required (dancer/user token).
- **Body**: `{ fullName, phone, email, idNumber, voucherImage }`
- **Behavior**:
  - Validate input and auth.
  - Check duplicate: if user already has an enrollment for this academy with status `pending` or `approved`, return **409 Conflict** or **200** with `{ success: false, message: "Already enrolled" }`.
  - Create enrollment with `status: "pending"`.
  - Store voucher (e.g. save image to storage, store URL in enrollment).
  - Notify the academy (email + optional push): e.g. “New enrollment request from [name] for [academy name]. Review in the dashboard.”
  - Return **200** with `{ success: true }` or `{ success: true, enrollmentId }`.

### 3. Endpoints for academy dashboard

- **List enrollments for an academy**
  - **Endpoint**: `GET /api/academy/:academyId/enrollments`  
    Or: `GET /api/academy/enrollments` (current academy from token).
  - **Auth**: Academy admin/owner token (ensure token is scoped to that academy).
  - **Query**: Optional `?status=pending` (default: all, or only pending).
  - **Response**: Array of enrollments, e.g.  
    `[{ id, userId, fullName, phone, email, idNumber, voucherImageUrl, status, createdAt }, ...]`  
  - Only return enrollments for academies the authenticated user is allowed to manage.

- **Get one enrollment (detail)**
  - **Endpoint**: `GET /api/academy/:academyId/enrollments/:enrollmentId`  
    Or: `GET /api/enrollments/:enrollmentId` with academy scope check.
  - **Auth**: Academy admin/owner.
  - **Response**: Full enrollment object including voucher URL/link so dashboard can show the payment voucher image.

- **Approve enrollment**
  - **Endpoint**: `PATCH /api/academy/:academyId/enrollments/:enrollmentId`  
    Or: `POST /api/enrollments/:enrollmentId/approve`.
  - **Auth**: Academy admin/owner.
  - **Body**: `{ status: "approved" }` or action: `"approve"`.
  - **Behavior**:
    - Ensure enrollment exists and belongs to that academy and is `pending`.
    - Update `status` to `"approved"`, set `reviewedAt`, `reviewedBy` if you have them.
    - Notify the dancer (email + optional push): e.g. “Your enrollment at [academy name] has been approved.”
    - Optionally update user’s profile (e.g. set `academyId` or `enrolledAcademy` on user so app shows “Enrolled”).
  - **Response**: Updated enrollment or `{ success: true }`.

- **Reject enrollment**
  - **Endpoint**: Same as approve, e.g. `PATCH .../enrollments/:enrollmentId` with `{ status: "rejected" }` or `POST .../reject`.
  - **Auth**: Academy admin/owner.
  - **Behavior**:
    - Ensure enrollment is `pending` and belongs to that academy.
    - Update `status` to `"rejected"`, set `reviewedAt`, `reviewedBy`.
    - Optionally notify the dancer: “Your enrollment at [academy name] was not approved. Contact the academy for more information.”
  - **Response**: Updated enrollment or `{ success: true }`.

### 4. Optional: enrollment status for the dancer (mobile app)

- **Endpoint**: `GET /api/academy/:academyId/enrollment`  
  Or: `GET /api/user/enrollments` and filter by academy.
- **Auth**: Dancer/user token.
- **Response**: `{ enrolled: true }` if the current user has at least one enrollment for this academy with status `approved` (or `pending` + approved, depending on product).  
  Or: `{ enrolled: false }` / `{ status: "pending" | "approved" | "rejected" }`.
- Used by the app to disable the Enroll button and show “Already enrolled” or “Pending approval.”

### 5. Notifications

- **On new enrollment (to academy)**: Email to academy contact; optional in-app or push notification for academy admins.
- **On approval (to dancer)**: Email and optional push: “Your enrollment at [academy name] has been approved.”
- **On rejection (to dancer)**: Optional email/push: “Your enrollment at [academy name] was not approved.”

---

## Web Dashboard – Requirements

Implement the following in your **academy web dashboard** (React, Next, Vue, or equivalent).

### 1. Auth and scope

- Academy admins/owners log in (same auth as API or linked to API).
- After login, dashboard knows the **academy id(s)** the user manages (from token or user profile).
- All enrollment screens are scoped to “current academy.”

### 2. Enrollments section

- **Navigation**: e.g. “Enrollments” or “Requests” in the main menu.
- **List view**:
  - Table or card list of enrollments for the current academy.
  - Columns/cards: applicant name, email, phone, date submitted, **status** (Pending / Approved / Rejected).
  - Filter by status: e.g. “Pending”, “All”.
  - Default view: show **pending** enrollments first (or a dedicated “Pending” tab).
- **Row/card actions**:
  - “View” or click row: open detail view.
  - For **pending** items: **Approve** and **Reject** buttons (or dropdown with Approve/Reject).

### 3. Enrollment detail view

- **Route**: e.g. `/enrollments/:enrollmentId` or `/academy/enrollments/:id`.
- **Content**:
  - Applicant: full name, email, phone, ID number.
  - **Payment voucher**: show the uploaded image (use voucher URL from API).
  - Submitted date (and optionally reviewed date + reviewer if you store them).
  - Status badge: Pending / Approved / Rejected.
- **Actions** (only when status is Pending):
  - **Approve** button: calls API to approve; on success show success message and update status to Approved (or redirect to list).
  - **Reject** button: optionally ask for a short reason (if API supports it); call API to reject; on success update UI.

### 4. API integration

- **List**: `GET /api/academy/:academyId/enrollments` (or your equivalent) with `?status=pending` when viewing pending.
- **Detail**: `GET /api/academy/:academyId/enrollments/:enrollmentId` to load one enrollment and voucher URL.
- **Approve**: `PATCH .../enrollments/:enrollmentId` with `{ status: "approved" }` or `POST .../approve`.
- **Reject**: `PATCH .../enrollments/:enrollmentId` with `{ status: "rejected" }` or `POST .../reject`.
- Use the same base URL and auth (e.g. Bearer token) as the rest of your backend.

### 5. UX details

- Clear labels: “Enrollment requests”, “Pending”, “Approved”, “Rejected”.
- After approve/reject, show a short success message and refresh the list or detail.
- If the API returns an error (e.g. 403, 404), show a user-friendly message.
- Optional: confirmation modal before Reject (“Are you sure you want to reject this enrollment?”).

---

## Summary for implementers

- **API**: Persist enrollments with `status`; enforce one enrollment per user per academy; expose list/detail/approve/reject for academy-scoped users; notify academy on new enrollment and dancer on approve/reject.
- **Dashboard**: Enrollments section scoped to current academy; list (with status filter); detail view with applicant info and voucher image; Approve and Reject actions that call the API and update UI.

Use this prompt in the **API** and **web dashboard** repos so both sides implement the same academy approval process consistently.
