# FixItNow Frontend — API Integration

## Base URL

```env
BACKEND_API_URL=https://fix-it-now-app.vercel.app/api
```

All endpoints below are relative to this base URL.

---

## Public Endpoints

| Method | Endpoint | Frontend Route / Component | Purpose |
|---|---|---|---|
| POST | `/users/register` | `/register` → `RegisterForm` | Register a new user |
| POST | `/auth/login` | `/login` → `LoginForm` | Log in |
| POST | `/auth/refresh-token` | `proxy.ts`, `refreshToken.ts` | Refresh access token |
| GET | `/service` | `/services` → service grid, search, filters, sorting, pagination | Get services |
| GET | `/service/featured` | `/` → featured services section | Get featured services |
| GET | `/technician` | `/technicians` → technician grid | Get technicians |
| GET | `/technician/:id` | `/technicians/[id]` → profile, reviews, services | Get one technician |
| GET | `/category` | Service filters, technician service form, admin categories | Get categories |

### Service query parameters

```text
searchTerm
category
location
rating
minPrice
maxPrice
sortBy
sortOrder
page
limit
```

### Technician query parameters

```text
searchTerm
location
status
minHourlyRate
maxHourlyRate
sortBy
sortOrder
page
limit
```

---

## Authenticated Common Endpoint

| Method | Endpoint | Frontend Component | Purpose |
|---|---|---|---|
| GET | `/auth/me` | `Navbar`, dashboard layouts, `getMe()` | Get the current user and role |

---

## Customer Endpoints

Requires `Role.CUSTOMER`.

| Method | Endpoint | Frontend Route / Component | Purpose |
|---|---|---|---|
| POST | `/booking` | `BookingModal` | Create a booking |
| GET | `/booking` | `/dashboard/bookings` → `BookingTable` | Get customer bookings |
| GET | `/booking/:id` | Booking details/payment flow | Get one customer-owned booking |
| PATCH | `/booking/:id/cancel` | `CustomerCancelBookingButton` | Cancel an eligible booking |
| POST | `/payments/create` | `PaymentButton` | Create Stripe Checkout session |
| GET | `/payments` | `/dashboard/payments` | Get payment history |
| GET | `/payments/:id` | Payment details page | Get one payment |
| POST | `/reviews` | `ReviewModal` | Submit a review |
| POST | `/technician/register` | `/technician/register` | Convert a customer account to technician |

### Booking payload

```json
{
  "slotStart": "2026-08-05T09:00:00.000Z",
  "slotEnd": "2026-08-05T10:30:00.000Z",
  "notes": "Please inspect the AC cooling issue.",
  "customerAddress": "House 12, Road 5, Dhaka",
  "serviceId": "SERVICE_ID"
}
```

### Customer cancellation rule

Allowed:

```text
REQUESTED
ACCEPTED
```

Not allowed:

```text
PAID
IN_PROGRESS
COMPLETED
CANCELLED
DECLINED
```

### Payment payload

```json
{
  "bookingId": "BOOKING_ID"
}
```

### Review payload

```json
{
  "bookingId": "BOOKING_ID",
  "rating": 5,
  "comment": "Excellent service and professional behavior."
}
```

### Existing customer → technician payload

```json
{
  "bio": "Experienced home service technician.",
  "experience": "3 years",
  "location": "Dhaka, Bangladesh",
  "hourlyRate": 900,
  "profilePhoto": "https://example.com/photo.jpg"
}
```

After conversion, issue a new JWT or require login again so the token contains `TECHNICIAN`.

---

## Technician Endpoints

Requires `Role.TECHNICIAN`.

| Method | Endpoint | Frontend Route / Component | Purpose |
|---|---|---|---|
| GET | `/technician/dashboard` | `/technician-dashboard` | Get technician dashboard summary |
| PATCH | `/technician/profile` | `/technician-dashboard/profile` | Update technician profile |
| GET | `/technician/availability` | `/technician-dashboard/availability` | Get technician availability |
| PATCH | `/technician/availability` | `WeeklyAvailabilityForm` | Update availability |
| GET | `/technician/bookings` | Technician booking table | Get assigned bookings |
| PATCH | `/technician/bookings/:id` | Technician booking actions | Update booking status |
| POST | `/service` | Technician service form | Create a service |
| GET | `/service` | Technician service list | Get services |
| PATCH | `/service/:id` | Service edit form | Update a service |
| DELETE | `/service/:id` | Service delete action | Delete a service |

### Profile payload

```json
{
  "bio": "Experienced technician specializing in electrical repairs.",
  "experience": "5 years",
  "location": "Khulna, Bangladesh",
  "hourlyRate": 900,
  "profilePhoto": "https://example.com/photo.jpg"
}
```

### Availability payload

```json
[
  {
    "dayOfWeek": 1,
    "startTime": "2026-01-05T09:00:00.000Z",
    "endTime": "2026-01-05T17:00:00.000Z"
  }
]
```

### Booking status payload

```json
{
  "status": "IN_PROGRESS"
}
```

### Valid technician transitions

```text
REQUESTED → ACCEPTED
REQUESTED → DECLINED
PAID → IN_PROGRESS
IN_PROGRESS → COMPLETED
```

> Confirm `PATCH /service/:id` and `DELETE /service/:id` exist in the deployed backend before submission.

---

## Admin Endpoints

Requires `Role.ADMIN`.

| Method | Endpoint | Frontend Route / Component | Purpose |
|---|---|---|---|
| GET | `/admin/dashboard` | `/admin-dashboard` | Get platform statistics |
| GET | `/admin/users` | `/admin-dashboard/user-management` | Get users with search and pagination |
| PATCH | `/admin/users/:id` | Ban/Unban button | Update user status |
| GET | `/admin/bookings` | `/admin-dashboard/bookings` | Get all bookings |
| GET | `/category` | `/admin-dashboard/categories` | Get categories |
| POST | `/admin/category` | Category dialog | Create category |

### Admin user query parameters

```text
searchTerm
page
limit
```

### User status payload

```json
{
  "status": "BLOCKED"
}
```

or:

```json
{
  "status": "ACTIVE"
}
```

### Category payload

```json
{
  "name": "PC Repairs"
}
```

---

## Frontend Route-to-Endpoint Map

| Next.js Route | Main Component / Feature | Backend Endpoint |
|---|---|---|
| `/` | Featured services | `GET /service/featured` |
| `/services` | Search, filters, sorting, pagination | `GET /service`, `GET /category` |
| `/technicians` | Technician listing | `GET /technician` |
| `/technicians/[id]` | Profile, reviews, services, booking | `GET /technician/:id`, `POST /booking` |
| `/login` | Login | `POST /auth/login`, `GET /auth/me` |
| `/register` | General registration | `POST /users/register` |
| `/technician/register` | Technician registration/conversion | `POST /users/register` or `POST /technician/register` |
| `/dashboard` | Customer overview | `GET /booking`, `GET /payments` |
| `/dashboard/bookings` | Booking history, cancel, pay, review | `GET /booking`, `PATCH /booking/:id/cancel`, `POST /payments/create`, `POST /reviews` |
| `/dashboard/payments` | Payment history | `GET /payments`, `GET /payments/:id` |
| `/technician-dashboard` | Technician summary | `GET /technician/dashboard` |
| `/technician-dashboard/profile` | Technician profile | `PATCH /technician/profile` |
| `/technician-dashboard/services` | Service management | `GET /service`, `POST /service`, `PATCH /service/:id`, `DELETE /service/:id` |
| `/technician-dashboard/availability` | Weekly scheduler | `GET /technician/availability`, `PATCH /technician/availability` |
| `/technician-dashboard/technician/bookings` | Booking management | `GET /technician/bookings`, `PATCH /technician/bookings/:id` |
| `/admin-dashboard` | Admin statistics | `GET /admin/dashboard` |
| `/admin-dashboard/user-management` | User management | `GET /admin/users`, `PATCH /admin/users/:id` |
| `/admin-dashboard/categories` | Category management | `GET /category`, `POST /admin/category` |
| `/admin-dashboard/bookings` | Global booking table | `GET /admin/bookings` |

---

## Authentication in Server Actions

```ts
const accessToken = await isAccessTokenExist();

const response = await fetch(
  `${process.env.BACKEND_API_URL}/booking`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${accessToken}`,
    },
    cache: "no-store",
  },
);
```

---

## Error Handling

The frontend uses:

- Sonner toast notifications
- Inline validation
- Skeleton loaders
- Empty states
- Confirmation dialogs
- `error.tsx`
- `not-found.tsx`
- Disabled buttons during pending actions

---

## Security Note

All backend user queries must omit passwords, including nested user relations.

```ts
user: {
  omit: {
    password: true,
  },
}
```

---

## Submission Information

```text
Frontend Repository : [ADD FRONTEND GITHUB URL]
Live Frontend       : [ADD VERCEL URL]
Backend API         : https://fix-it-now-app.vercel.app/api
Demo Video          : [ADD VIDEO URL]
Admin Email         : [ADD ADMIN EMAIL]
Admin Password      : [ADD ADMIN PASSWORD]
```
