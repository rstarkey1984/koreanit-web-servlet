# MVC 패턴 (Model-View-Controller 패턴)

## 📘 학습 개요
웹 애플리케이션은 사용자의 요청(Request) 을 받아서 데이터베이스를 조회하거나 수정하고, 그 결과를 화면(View) 에 보여주는 구조로 동작합니다. 이때 비즈니스 로직(데이터 처리) 과 화면(View) 을 분리하여 효율적으로 관리하기 위한 설계 방식이 바로 MVC 패턴입니다.

웹 애플리케이션은 사용자의 요청(Request)을 받아 DB를 조회/수정하고, 그 결과를 화면(View)에 보여줍니다. 이때 **비즈니스 로직(데이터 처리)** 과 **표현(View)** 을 분리해 유지보수성과 확장성을 높이는 설계 방식이 MVC 패턴입니다.

> **MVC (Model–View–Controller)**

- Model: 데이터 및 비즈니스 로직 (예: DTO, DAO, Service)

- View: 사용자에게 보여지는 화면 (예: JSP/HTML, JavaScript, JSON)

- Controller: 요청 수신, 흐름 제어, Model 호출 (예: Servlet)

## 💡 주요 내용

- MVC 패턴의 필요성

- 각 구성요소의 역할

- 전체 요청 흐름 (Servlet 기반 MVC)


## 1. MVC 패턴의 필요성

- 역할 분리로 유지보수성/확장성 향상

- **Model(DTO, DAO, Service)** 을 통해 데이터 처리 로직 일원화

- **View(JSP/HTML)** 에서 비즈니스 로직 제거 → 깔끔한 화면 코드

- **Controller(Servlet)** 가 중심에서 전체 요청–응답 흐름 제어


## 2. 각 구성요소의 역할

| 구분                 | 역할                     | 예시 구성요소                         | 비고                                 |
| ------------------ | ---------------------- | ------------------------------- | ---------------------------------- |
| **Model (M)**      | 데이터 및 비즈니스 로직 처리       | **DTO, DAO, Service**           | DAO: DB 접근 / Service: 비즈니스 로직      |
| **View (V)**       | 사용자에게 결과 표시            | **JSP, HTML, JavaScript, JSON** | JSP는 `/WEB-INF/views/` 권장          |
| **Controller (C)** | 요청 수신, 흐름 제어, Model 호출 | **Servlet**                     | 파라미터 검증, forward/redirect, JSON 응답 |



## 3. 폴더 구조 예시

```
WEB-INF/src/localhost/myapp/
 ├── user/
 │    ├── UserController.java // Controller
 │    ├── UserService.java    // Service
 │    ├── UserDao.java        // DAO 
 │    └── User.java           // DTO 
 │
 └── board/
      ├── BoardController.java // Controller
      ├── BoardService.java    // Service
      ├── BoardDao.java        // DAO
      └── Board.java           // DTO 

WEB-INF/view                   // View
```


## 4. 전체 요청 흐름 (Servlet 기반 MVC)
```sql
[사용자 브라우저]
     │
     ▼
(1) HTTP 요청 (ex. /user/register)
     │
     ▼
@WebServlet("/user/*")  ← 컨트롤러(Controller)
───────────────────────────────
  ▽ doGet/doPost 메서드  
  ▷ 요청 파라미터 추출
  ▷ 기본 유효성 검증
  ▷ Service 호출
───────────────────────────────
     │
     ▼
(2) Service (비즈니스 로직)
───────────────────────────────
  ▷ 트랜잭션 단위 로직
  ▷ DAO 조합 및 결과 처리
───────────────────────────────
     │
     ▼
(3) DAO (데이터 접근 계층)
───────────────────────────────
  ▷ DataSource로 DB 커넥션 풀에서 연결 획득
  ▷ SQL 실행
  ▷ 결과 DTO 객체로 반환
───────────────────────────────
     │
     ▼
(4) Service → Controller 로 결과 반환
     │
     ▼
(5) View 로 전달 (JSP or JSON)
───────────────────────────────
  ▷ request.setAttribute("user", user)
  ▷ forward("/WEB-INF/views/user/success.jsp")
  ▷ 또는 JSON 응답(resp.getWriter().write(json))
───────────────────────────────
     │
     ▼
(6) JSP (View)
───────────────────────────────
  ▷ ${user.id}, ${errorMsg} 등 EL 표현식으로 표시
───────────────────────────────
```

## 💡 **요약정리**  

> MVC(Model–View–Controller)는 웹 애플리케이션의 구조를 역할별로 분리하는 설계 패턴이며 코드의 유지보수성, 확장성, 협업 효율성을 높이기 위해 사용된다.