# Software Engineering Practical File

## Student Details
- Name: ____________________
- Roll No.: ____________________
- Class/Semester: ____________________
- Subject: Software Engineering Lab
- Session: ____________________

## Index
1. Role of Software in Modern Domains
2. Software Process Model Selection
3. Software Requirement Specification (SRS)
4. UML Modeling
5. Project Estimation using COCOMO Model
6. Deployment Diagram
7. Risk Management Chart
8. Gantt Chart and PERT Chart
9. Test Case Design
10. Version Control using Git and GitHub
11. Agile Development using Scrum
12. API Development and Testing
13. Introduction to DevOps
14. AI-assisted Coding using GitHub Copilot
15. LLM-Based Application Development
16. Software Testing using Automation Tools

---

## 1. Role of Software in Modern Domains

### Aim
To study the importance of software in different modern industries.

### Theory
Software has become the backbone of almost every industry. It helps organizations automate work, improve speed, reduce cost, increase accuracy, and deliver better services to users.

### Case Study Based Discussion

#### Healthcare
- Software is used in hospital management systems, electronic health records, telemedicine, appointment booking, and medical billing.
- It improves patient care, data storage, diagnostic support, and communication between doctors and patients.
- Example: A hospital management system can store patient history, lab reports, prescriptions, and discharge summaries.

#### Entertainment
- Software is used in OTT platforms, gaming, music streaming, video editing, and animation.
- It enables personalized recommendations, online streaming, digital content creation, and user analytics.
- Example: Platforms like Netflix and Spotify use software to suggest content according to user behavior.

#### Banking
- Banking software supports online transactions, mobile banking, ATM services, fraud detection, and account management.
- It ensures secure financial operations and faster customer service.
- Example: Mobile banking apps allow balance checks, money transfer, bill payments, and mini statements.

#### Retail
- Retail software is used in billing systems, e-commerce websites, inventory management, CRM, and digital payments.
- It helps in order tracking, stock control, customer engagement, and sales reporting.
- Example: Amazon-like systems use software for product listing, cart management, order processing, and delivery tracking.

#### Education
- Educational software supports online learning, attendance, examinations, student records, and digital classrooms.
- It increases accessibility and supports hybrid learning models.
- Example: Learning Management Systems allow teachers to upload notes, assignments, quizzes, and grades.

### Conclusion
Software plays a vital role in all modern domains by improving efficiency, communication, and user experience.

---

## 2. Software Process Model Selection

### Aim
To compare software process models and select the best one for a chosen system.

### Chosen System
Online Learning Management System (LMS)

### Models Compared

#### Waterfall Model
- Sequential model with fixed phases.
- Best when requirements are clear and stable.
- Advantage: Easy to manage and document.
- Limitation: Difficult to handle changing requirements.

#### Agile Model
- Iterative and incremental model.
- Best when requirements change frequently.
- Advantage: Continuous feedback, faster releases, flexible planning.
- Limitation: Requires close collaboration and active stakeholder involvement.

#### Spiral Model
- Risk-driven iterative model.
- Best for large and high-risk systems.
- Advantage: Strong focus on risk analysis.
- Limitation: Costly and complex for small projects.

### Comparison Summary

| Model | Flexibility | Risk Handling | Customer Involvement | Best Use |
|---|---|---|---|---|
| Waterfall | Low | Low | Low | Stable projects |
| Agile | High | Medium | High | Dynamic projects |
| Spiral | Medium | High | Medium | Large risky projects |

### Best Model for LMS
Agile is the best model for an LMS because educational platforms need frequent updates, user feedback, feature improvements, and regular testing.

### Conclusion
Agile is most suitable for the selected system due to its adaptability, faster delivery, and user-focused development.

---

## 3. Software Requirement Specification (SRS)

### Aim
To prepare the SRS for the selected system.

### Project Title
Online Learning Management System

### Introduction
The LMS is a web-based application that allows students, teachers, and administrators to manage courses, assignments, quizzes, attendance, and learning materials.

### Functional Requirements
- User registration and login
- Role-based access for admin, teacher, and student
- Course creation and enrollment
- Upload and download study material
- Assignment submission
- Quiz and test management
- Attendance tracking
- Notifications and announcements
- Report generation

### Non-functional Requirements
- The system should be secure and password protected.
- The system should be available 24x7.
- Pages should load within a reasonable time.
- The application should support multiple browsers.
- The data should be backed up regularly.
- The interface should be simple and user-friendly.

### Use Cases

#### Student
- Register and log in
- Enroll in course
- View study material
- Submit assignment
- Attempt quiz
- Check results

#### Teacher
- Log in
- Create course
- Upload content
- Create assignments and quizzes
- Evaluate submissions
- Track attendance

#### Admin
- Manage users
- Manage departments and courses
- Monitor overall system
- Generate reports

### Conclusion
The SRS defines the scope and expected behavior of the LMS clearly and acts as the foundation for development.

---

## 4. UML Modeling

### Aim
To design UML models for the selected system.

### Use Case Diagram

Actors:
- Admin
- Teacher
- Student

Main Use Cases:
- Login
- Manage Users
- Create Course
- Upload Material
- Enroll in Course
- Submit Assignment
- Conduct Quiz
- View Result

Textual representation:

```text
Student  -> Login, Enroll in Course, View Material, Submit Assignment, Attempt Quiz, View Result
Teacher  -> Login, Create Course, Upload Material, Create Quiz, Evaluate Assignment
Admin    -> Login, Manage Users, Generate Reports, Monitor System
```

### Class Diagram

Classes:
- User
- Student
- Teacher
- Admin
- Course
- Assignment
- Quiz
- Result

Relationships:
- Student, Teacher, and Admin inherit from User
- Teacher manages Course
- Student enrolls in Course
- Course contains Assignment and Quiz
- Quiz generates Result

Textual representation:

```text
User(userId, name, email, password)
Student(enrollmentNo, semester)
Teacher(employeeId, department)
Admin(adminId)
Course(courseId, title, description)
Assignment(assignmentId, dueDate)
Quiz(quizId, totalMarks)
Result(resultId, score)
```

### Object Diagram

Sample objects:

```text
student1 : Student = {name = "Aman", enrollmentNo = "23CS101"}
teacher1 : Teacher = {name = "Riya", employeeId = "T12"}
course1  : Course  = {title = "Software Engineering"}
quiz1    : Quiz    = {quizId = "Q1", totalMarks = 20}
```

### Conclusion
UML models help visualize system structure, actors, and interactions before implementation.

---

## 5. Project Estimation using COCOMO Model

### Aim
To estimate effort and development time using the COCOMO model.

### Assumption
- Project type: Organic
- Estimated size: 25 KLOC

### Basic COCOMO Formula
- Effort (Person-Months) = 2.4 x (KLOC)^1.05
- Development Time (Months) = 2.5 x (Effort)^0.38

### Calculation
- Effort = 2.4 x (25)^1.05
- Effort approximately = 70.4 person-months
- Development Time = 2.5 x (70.4)^0.38
- Development Time approximately = 12.6 months

### Interpretation
- Approximate team effort required: 70.4 person-months
- Approximate schedule required: 12 to 13 months

### Conclusion
COCOMO helps estimate the required resources and time in the early planning phase.

---

## 6. Deployment Diagram

### Aim
To prepare the deployment architecture of the system.

### Nodes
- Client Device
- Web Server
- Application Server
- Database Server

### Textual Deployment Diagram

```text
[Client Browser]
      |
      v
[Web Server]
      |
      v
[Application Server]
      |
      v
[Database Server]
```

### Explanation
- Users access the system from laptops or mobile browsers.
- Requests first reach the web server.
- Business logic is handled by the application server.
- Data is stored in the database server.

### Conclusion
The deployment diagram shows how hardware and software components are arranged in the real environment.

---

## 7. Risk Management Chart

### Aim
To identify and manage project risks.

### Risk Chart

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Requirement changes | High | High | Use Agile and frequent review meetings |
| Server downtime | Medium | High | Use backup server and monitoring |
| Security breach | Medium | High | Apply authentication, encryption, and audits |
| Delay in development | High | Medium | Divide work into sprints and track progress |
| Data loss | Low | High | Regular database backup |
| Lack of user training | Medium | Medium | Provide demos and user manuals |

### Conclusion
Risk management improves project success by identifying issues early and preparing mitigation plans.

---

## 8. Gantt Chart and PERT Chart

### Aim
To prepare project scheduling charts.

### Gantt Chart

| Task | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Week 6 |
|---|---|---|---|---|---|---|
| Requirement Gathering | Done |  |  |  |  |  |
| System Design |  | Done | Done |  |  |  |
| Development |  |  | Done | Done | Done |  |
| Testing |  |  |  | Done | Done |  |
| Deployment |  |  |  |  |  | Done |

### PERT Chart

```text
Start
  |
  v
Requirement Gathering
  |
  v
System Design
  |
  v
Development
  |
  v
Testing
  |
  v
Deployment
  |
  v
End
```

### Conclusion
Gantt and PERT charts help in planning, scheduling, and tracking project progress effectively.

---

## 9. Test Case Design

### Aim
To design test cases for the selected system.

### Sample Test Cases

| Test Case ID | Module | Input | Expected Output | Result |
|---|---|---|---|---|
| TC01 | Login | Valid email and password | User logged in successfully | Pass |
| TC02 | Login | Invalid password | Error message displayed | Pass |
| TC03 | Registration | New student details | Account created successfully | Pass |
| TC04 | Course Enrollment | Select valid course | Enrollment successful | Pass |
| TC05 | Assignment Upload | Valid file | File uploaded successfully | Pass |
| TC06 | Quiz | Correct answers submitted | Score generated | Pass |

### Conclusion
Test cases help verify whether each function of the system works as expected.

---

## 10. Version Control using Git and GitHub

### Aim
To understand repository creation, commits, push operations, and branching.

### Steps
1. Create a local project folder.
2. Initialize Git repository using `git init`.
3. Add files using `git add .`.
4. Commit changes using `git commit -m "Initial commit"`.
5. Create a GitHub repository.
6. Connect local and remote repository using `git remote add origin <repo-url>`.
7. Push code using `git push -u origin main`.
8. Create a branch using `git branch feature-login`.
9. Switch branch using `git checkout feature-login`.
10. Merge branch into main after testing.

### Common Commands

```bash
git init
git add .
git commit -m "Initial commit"
git branch feature-login
git checkout feature-login
git checkout main
git merge feature-login
git push origin main
```

### Conclusion
Git and GitHub help manage source code, collaboration, branch handling, and version history.

---

## 11. Agile Development using Scrum

### Aim
To understand Agile development with Scrum practices.

### Scrum Concepts
- Product Backlog: List of all required features
- Sprint: Short development cycle, usually 1 to 4 weeks
- Sprint Planning: Meeting to select tasks for a sprint
- Daily Scrum: Daily stand-up to discuss progress
- Sprint Review: Demo of completed work
- Sprint Retrospective: Discussion on improvements

### Sample Product Backlog
- User login
- Course management
- Assignment upload
- Quiz module
- Attendance tracking
- Notification system

### Sample Sprint Plan
- Sprint 1: Authentication and user roles
- Sprint 2: Course and content management
- Sprint 3: Assignment and quiz modules
- Sprint 4: Testing and deployment

### Conclusion
Scrum supports teamwork, continuous improvement, and regular delivery of valuable software.

---

## 12. API Development and Testing

### Aim
To build and test a REST API using Postman.

### Sample API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | Fetch all courses |
| GET | `/api/courses/{id}` | Fetch one course |
| POST | `/api/courses` | Create a new course |
| PUT | `/api/courses/{id}` | Update a course |
| DELETE | `/api/courses/{id}` | Delete a course |

### Example JSON Request

```json
{
  "title": "Software Engineering",
  "description": "Core concepts of software development",
  "teacher": "Riya Sharma"
}
```

### Postman Testing
- Send GET request to fetch data.
- Send POST request with JSON body to create data.
- Verify response status codes such as 200, 201, 400, and 404.
- Validate response body content.

### Conclusion
REST APIs allow communication between frontend and backend systems, and Postman helps test them easily.

---

## 13. Introduction to DevOps

### Aim
To understand basic DevOps and CI/CD with GitHub Actions.

### Theory
DevOps combines development and operations practices to improve software delivery speed, reliability, and automation.

### CI/CD Basics
- CI means Continuous Integration.
- CD means Continuous Delivery or Continuous Deployment.
- Developers regularly push code to a shared repository.
- Automated workflows build, test, and deploy the application.

### GitHub Actions Workflow Example

```yaml
name: CI Pipeline
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

### Conclusion
DevOps helps automate testing, integration, and deployment, resulting in faster and more reliable releases.

---

## 14. AI-assisted Coding using GitHub Copilot

### Aim
To understand how AI tools assist developers in writing code.

### Usage
- GitHub Copilot suggests code while typing in the editor.
- It helps generate functions, loops, boilerplate code, and comments.
- It improves productivity for repetitive tasks.

### Manual vs AI-assisted Coding

| Aspect | Manual Coding | AI-assisted Coding |
|---|---|---|
| Speed | Slower | Faster |
| Boilerplate generation | Manual effort | Auto-suggested |
| Error handling ideas | Developer dependent | Often suggested |
| Learning support | Self-driven | Example-based support |

### Observation
- AI tools are useful for productivity.
- Human review is still necessary for correctness, security, and maintainability.

### Conclusion
GitHub Copilot can speed up development, but the final responsibility remains with the developer.

---

## 15. LLM-Based Application Development

### Aim
To create a small project using a Large Language Model (LLM).

### Project Idea
AI Study Assistant for Students

### Features
- Accepts student questions
- Generates topic explanations
- Summarizes notes
- Creates short quiz questions
- Suggests study plans

### Working
1. User enters a question.
2. The application sends the prompt to an LLM API.
3. The LLM generates a response.
4. The result is shown in the interface.

### Sample Prompt
`Explain the waterfall model in simple words for a BCA student.`

### Technology Stack
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js or Python
- LLM API: Any available LLM service

### Conclusion
LLM-based applications can improve learning, assistance, and productivity by generating useful responses from natural language input.

---

## 16. Software Testing using Automation Tools

### Aim
To understand automation testing using Selenium.

### Theory
Automation testing uses tools to run test scripts automatically. It saves time in repetitive testing and improves test coverage.

### Selenium Basics
- Selenium is used for browser automation.
- It can test login forms, navigation, button clicks, and validation messages.
- It supports multiple browsers and programming languages.

### Sample Selenium Test Flow
1. Open browser
2. Visit login page
3. Enter username and password
4. Click login button
5. Verify dashboard page opens

### Sample Python Code

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://example.com/login")
driver.find_element(By.NAME, "email").send_keys("student@example.com")
driver.find_element(By.NAME, "password").send_keys("123456")
driver.find_element(By.TAG_NAME, "button").click()
print(driver.title)
driver.quit()
```

### Conclusion
Selenium makes it easier to automate repetitive browser-based testing tasks.

---

## Final Conclusion
This practical file covers major software engineering lab topics including process models, SRS, UML, estimation, planning, testing, Git, Scrum, API development, DevOps, AI-assisted coding, LLM applications, and automation testing. These practicals provide both theoretical understanding and hands-on knowledge required in modern software engineering.
