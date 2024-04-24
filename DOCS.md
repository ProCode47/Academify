# API Documentation
---
## Understanding URL Parameters
In our API endpoints, you might come across URLs that contain variables prefixed with a colon (`:`), such as `/api/messages/student/:studentId`.

### What is `:variable`?

The `:variable` syntax in URLs indicates a placeholder for a specific value. When making a request to such endpoints, you need to replace `:variable` with the actual value it represents.

### Example:

For the URL `/api/messages/student/:studentId`, you would replace `:studentId` with the actual ID of the student you want to interact with.

#### Example Request:

```http
GET /api/messages/student/12345
```

In this example, `12345` is the actual ID of the student.
---

## Register Routes

### Register Student

Registers a new student account.

- **URL:** `/register/student`
- **Method:** `POST`
- **Description:** Register a new student account.
- **Request Body:**
  - `firstName` (string): The first name of the student.
  - `lastName` (string): The last name of the student.
  - `email` (string): The email address of the student.
  - `password` (string): The password of the student account.
  - `reg` (string): The registration number of the student.
  - `advisor` (string): The ID of the course advisor assigned to the student.
- **Example Request:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "reg": "20230001",
    "advisor": "6152f8a91b6cf4a2443d2e4c"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### Register Parent

Registers a new parent account.

- **URL:** `/register/parent`
- **Method:** `POST`
- **Description:** Register a new parent account.
- **Request Body:**
  - `firstName` (string): The first name of the parent.
  - `lastName` (string): The last name of the parent.
  - `email` (string): The email address of the parent.
  - `password` (string): The password of the parent account.
- **Example Request:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "password": "password123"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### Register Course Advisor

Registers a new course advisor account.

- **URL:** `/register/courseadvisor`
- **Method:** `POST`
- **Description:** Register a new course advisor account.
- **Request Body:**
  - `firstName` (string): The first name of the course advisor.
  - `lastName` (string): The last name of the course advisor.
  - `email` (string): The email address of the course advisor.
  - `password` (string): The password of the course advisor account.
- **Example Request:**
  ```json
  {
    "firstName": "Francesca",
    "lastName": "Smith",
    "email": "francesca.smith@example.com",
    "password": "password123"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

---

## Login Routes

### Login Student

Logs in a student.

- **URL:** `/login/student`
- **Method:** `POST`
- **Description:** Log in a student account.
- **Request Body:**
  - `email` (string): The email address of the student.
  - `password` (string): The password of the student account.
- **Example Request:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### Login Parent

Logs in a parent.

- **URL:** `/login/parent`
- **Method:** `POST`
- **Description:** Log in a parent account.
- **Request Body:**
  - `email` (string): The email address of the parent.
  - `password` (string): The password of the parent account.
- **Example Request:**
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "password123"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### Login Course Advisor

Logs in a course advisor.

- **URL:** `/login/courseadvisor`
- **Method:** `POST`
- **Description:** Log in a course advisor account.
- **Request Body:**
  - `email` (string): The email address of the course advisor.
  - `password` (string): The password of the course advisor account.
- **Example Request:**
  ```json
  {
    "email": "francesca.smith@example.com",
    "password": "password123"
  }
  ```
- **Example Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

---

### Route to Get All Course Advisors

#### Description

This route allows you to retrieve a list of all course advisors.

- **URL:** `/advisors/get-all`
- **Method:** `GET`
- **Auth Required:** No
- **Permissions Required:** None

#### Parameters

None

#### Responses

- **200 OK:** Successfully retrieved the list of course advisors.
  - **Content:** JSON array containing details of all course advisors.
- **500 Internal Server Error:** An error occurred on the server while processing the request.

#### Example Response

```json
[
  {
    "_id": "611fc69c8f5d670015c4d78a",
    "name": "Mrs. Francesca",
    "department": "Computer Science",
    "email": "francesca@example.com"
  },
  {
    "_id": "611fc6c38f5d670015c4d78b",
    "name": "Mr. John Doe",
    "department": "Electrical Engineering",
    "email": "john@example.com"
  }
]
```
---

## Student Routes

### Get Student by Registration Number

Retrieves information about a student by their registration number.

- **URL:** `/student/:regNo`
- **Method:** `GET`
- **Description:** Get student information by registration number.
- **Example Response:**
  ```json
  {
    "_id": "6152f8a91b6cf4a2443d2e4d",
    "firstName": "John",
    "lastName": "Doe",
    "reg": "20230001",
    "advisor": "6152f8a91b6cf4a2443d2e4c"
  }
  ```
---
## Courses Routes

### Register Courses

Registers courses for a student.

- **URL:** `/course/register`
- **Method:** `POST`
- **Description:** Register courses for a student.
- **Request Body:**
  - `reg` (string): The registration number of the student.
  - `courseCodes` (array of strings): An array of course codes to register.
- **Example Request:**
  ```json
  {
    "reg": "20230001",
    "courseCodes": ["MTH 101","PHY 101", "CHM 101"]
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Courses registered successfully"
  }
  ```

### Get Courses by Level and Semester

Retrieves courses for a particular level and semester.

- **URL:** `/courses/:level/:semester`
- **Method:** `GET`
- **Description:** Get courses for a particular level and semester.
- **Example Response:** Array of course objects

---

## Messaging Routes

### Messaging between Course Advisor and Student

#### Send Message to Student

Sends a message to a student.

- **URL:** `/api/messages/student/:studentId`
- **Method:** `POST`
- **Description:** Send a message to a student.
- **Request Body:**
  - `sender` (string): The ID of the sender of the message.
  - `content` (string): The content of the message.
- **Example Request:**
  ```json
  {
    "sender": "Francesca",
    "content": "Don't forget about the upcoming exam."
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Message sent to student successfully"
  }
  ```

#### Send Student Message to Advisor

Sends a message from a student to their advisor.

- **URL:** `/api/messages/student/advisor/:studentId`
- **Method:** `POST`
- **Description:** Send a message from a student to their advisor.
- **Request Body:**
  - `content` (string): The content of the message.
- **Example Request:**
  ```json
  {
    "content": "I have a question about the assignment."
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Message sent to advisor successfully"
  }
  ```

#### Get Messages from Student

Fetches messages from a student.

- **URL:** `/api/messages/student/:studentId`
- **Method:** `GET`
- **Description:** Fetch messages from a student.
- **Example Response:** Array of message objects

### Messaging between Parent and Course Advisor

#### Send Message to Parent

Sends a message to a parent.

- **URL:** `/api/messages/parent/:parentId`
- **Method:** `POST`
- **Description:** Send a message to a parent.
- **Request Body:**
  - `sender` (string): The ID of the sender of the message.
  - `content` (string): The content of the message.
- **Example Request:**
  ```json
  {
    "sender": "Francesca",
    "content": "Your child did well in the recent test."
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Message sent to parent successfully"
  }
  ```

#### Send Parent Message to Advisor

Sends a message from a parent to their child's advisor.

- **URL:** `/api/messages/parent/advisor/:studentId`
- **Method:** `POST`
- **Description:** Send a message from a parent to their child's advisor.
- **Request Body:**
  - `content` (string): The content of the message.
- **Example Request:**
  ```json
  {
    "content": "I have a concern about my child's progress."
  }
  ```
- **Example Response:**
  ```json
  {
    "message": "Message sent to advisor successfully"
  }
  ```

#### Get Messages from Parent

Fetches messages from a parent.

- **URL:** `/api/messages/parent/:parentId`
- **Method:** `GET`
- **Description:** Fetch messages from a parent.
- **Example Response:** Array of message objects

---


Retrieves the profile of the parent.

- **URL:** `/profile/parent`
- **Method:** `GET`
- **Description:** Retrieve the profile of the parent.
- **Example Response:**
  ```json
  {
    "_id": "6152f8a91b6cf4a2443d2e4e",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com"
  }
  ```

---