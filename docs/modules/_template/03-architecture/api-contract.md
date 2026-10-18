# Phase 3: API Contract — {{MODULE_NAME}}

> **Authority**: This contract is the single source of truth for Backend, Web, and Mobile.

---

## Base URL
`/api/v1/{{MODULE_NAME_KEBAB}}`

---

## 1. List / Query
- **Method**: `GET`
- **Path**: `/`
- **Auth**: Required (`Bearer JWT`)
- **Query Parameters**:
  - `page` (optional, default: 1): number
  - `limit` (optional, default: 20): number
  - `search` (optional): string (debounced min 300ms on client)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "6710abcd1234ef5678901234",
      "name": "Item Name",
      "amountMinor": 150000,
      "status": "ACTIVE",
      "createdAt": "2026-10-18T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

## 2. Create
- **Method**: `POST`
- **Path**: `/`
- **Auth**: Required (`Bearer JWT`)
- **Request Body**:
```json
{
  "name": "Item Name",
  "amountMinor": 150000
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "6710abcd1234ef5678901234",
    "name": "Item Name",
    "amountMinor": 150000,
    "status": "ACTIVE",
    "createdAt": "2026-10-18T00:00:00.000Z"
  },
  "message": "{{MODULE_NAME}} created successfully"
}
```

---

## 3. Update
- **Method**: `PUT`
- **Path**: `/:id`
- **Auth**: Required (`Bearer JWT`)
- **Request Body**: Partial update object
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": { ... },
  "message": "{{MODULE_NAME}} updated successfully"
}
```

---

## 4. Delete
- **Method**: `DELETE`
- **Path**: `/:id`
- **Auth**: Required (`Bearer JWT`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "{{MODULE_NAME}} deleted successfully"
}
```

---

## 5. Error Codes & Envelopes
| HTTP Status | Code | Meaning |
| :--- | :--- | :--- |
| `400` | `VALIDATION_FAILED` | Invalid request body or minor amount negative |
| `401` | `UNAUTHORIZED` | Expired or missing Bearer token |
| `403` | `FORBIDDEN` | User does not have access to this tenant |
| `404` | `NOT_FOUND` | Record does not exist or belongs to another business |
| `409` | `CONFLICT` | Unique constraint conflict (e.g. duplicate name/code) |
