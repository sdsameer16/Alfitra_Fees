# POSTMAN API REQUESTS FOR AL-FEES

## Base URL
```
http://localhost:5000/api/v1
```

---

## 1. LOGIN (Get Token First)

**Method:** POST  
**URL:** `http://localhost:5000/api/v1/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "teacher@alfitrah.com",
  "password": "teacher123"
}
```
**Response:** Copy the `token` from response

---

## 2. GET ALL FEES (Fee List)

**Method:** GET  
**URL:** `http://localhost:5000/api/v1/fees`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### With Pagination:
**URL:** `http://localhost:5000/api/v1/fees?page=1&limit=10`

### With Search:
**URL:** `http://localhost:5000/api/v1/fees?search=Sameer`

### Full Example:
**URL:** `http://localhost:5000/api/v1/fees?page=1&limit=10&search=`

---

## 3. GET SINGLE FEE (Receipt Details)

**Method:** GET  
**URL:** `http://localhost:5000/api/v1/fees/:id`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
http://localhost:5000/api/v1/fees/675661234567890abcdef123
```

---

## 4. CREATE FEE PAYMENT

**Method:** POST  
**URL:** `http://localhost:5000/api/v1/fees`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "student": "675661234567890abcdef123",
  "amount": 5000,
  "paymentDate": "2025-12-09",
  "paymentMode": "Cash",
  "feeType": "tuition",
  "year": 2025,
  "paidBy": {
    "name": "Abdul Rahman",
    "relation": "Father",
    "contact": "9876543210"
  },
  "remarks": "First installment payment"
}
```

---

## 5. GET FEES BY STUDENT

**Method:** GET  
**URL:** `http://localhost:5000/api/v1/fees/student/:studentId`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
http://localhost:5000/api/v1/fees/student/675661234567890abcdef123
```

---

## 6. GET ALL STUDENTS (To Get Student ID)

**Method:** GET  
**URL:** `http://localhost:5000/api/v1/students`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## RECEIPT NUMBER FORMAT

The receipt numbers are now **simple sequential numbers**:
- First payment: `1`
- Second payment: `2`
- Third payment: `3`
- And so on...

This persists in the database using a Counter collection, so even after restart:
- If last receipt was `10`, next will be `11`
- Numbers never repeat or reset

---

## FULL WORKFLOW IN POSTMAN

### Step 1: Login
```
POST http://localhost:5000/api/v1/auth/login
Body:
{
  "email": "teacher@alfitrah.com",
  "password": "teacher123"
}
```
→ Copy the token from response

### Step 2: Get Students
```
GET http://localhost:5000/api/v1/students
Headers:
Authorization: Bearer YOUR_TOKEN
```
→ Copy a student's `_id`

### Step 3: Create Fee Payment
```
POST http://localhost:5000/api/v1/fees
Headers:
Authorization: Bearer YOUR_TOKEN
Body:
{
  "student": "STUDENT_ID_FROM_STEP_2",
  "amount": 5000,
  "paymentMode": "Cash",
  "feeType": "tuition",
  "year": 2025,
  "paidBy": {
    "name": "Parent Name",
    "relation": "Father"
  }
}
```

### Step 4: Get Fee List
```
GET http://localhost:5000/api/v1/fees
Headers:
Authorization: Bearer YOUR_TOKEN
```
→ You should see your payment with receipt number `1` (or next sequential number)

### Step 5: Get Single Fee Receipt
```
GET http://localhost:5000/api/v1/fees/FEE_ID_FROM_STEP_4
Headers:
Authorization: Bearer YOUR_TOKEN
```
→ Full receipt details with student info, items, balance, etc.

---

## EXPECTED RESPONSE FORMAT

### GET /api/v1/fees Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10
  },
  "data": [
    {
      "_id": "675661234567890abcdef123",
      "receiptNumber": "1",
      "student": {
        "_id": "675661234567890abcdef456",
        "firstName": "Sameer",
        "lastName": "Syed",
        "rollNumber": "2024001",
        "class": "10th A"
      },
      "totalAmount": 5000,
      "paymentDate": "2025-12-09T00:00:00.000Z",
      "paymentMode": "Cash",
      "balanceAfterPayment": 45000,
      "items": [
        {
          "category": "Tuition",
          "description": "",
          "amount": 5000
        }
      ],
      "paidBy": {
        "name": "Abdul Rahman",
        "relation": "Father",
        "contact": "9876543210"
      }
    }
  ]
}
```

---

## NOTES

1. **Always include the Authorization header** with Bearer token (get from login)
2. **Receipt numbers start from 1** and increment sequentially
3. **Numbers persist** in the `counters` collection in MongoDB
4. **Payment creates fee record AND updates student balance** automatically
5. Use **student._id** for the student field, not the name

