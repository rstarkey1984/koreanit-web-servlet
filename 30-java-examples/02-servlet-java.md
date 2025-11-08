# Servlet에서 자주 사용하는 Java 기본 문법 정리

## 📘 학습 목표
- Servlet에서 주로 쓰는 Java 문법을 알아본다.
---

## 💡 주요 내용

- 클래스(Class)와 객체(Object)

- 패키지(package)와 import

- 상속 (extends)

- 오버라이드(@Override)

- 생성자(Constructor) vs 메서드(Method)

- 추상 메서드 와 인터페이스

- HttpServlet 구조 이해 (중요)
---

## 1. 클래스(Class)와 객체(Object)
| 구분             | 설명                       |
| -------------- | ------------------------ |
| **클래스(Class)** | 객체를 만들기 위한 설계도           |
| **객체(Object)** | 클래스를 기반으로 실제 메모리에 생성된 실체 |
```java
public class User {
    String name;
    int age;
    
    public void login() {
        System.out.println(name + " 로그인");
    }
}

// 객체 생성
User u = new User();
u.name = "홍길동";
u.login();

```

## 2. 패키지(package)와 import
```java
package user;  // 파일의 위치 (폴더 구조와 동일해야 함)

import java.io.PrintWriter;   // 다른 패키지에 있는 클래스 사용
```


## 3. 상속 (extends)
> Servlet은 반드시 HttpServlet 추상 클래스를 상속해서 만들어집니다.

```java
// MyServlet은 HttpServlet 클래스 기능을 물려받음
public class MyServlet extends HttpServlet {

}
```
- 추상클래스란? 객체를 만들기 위한 설계도인데, 자식이 완성해야 하는 ‘미완성 설계도’이다.

## 4. 오버라이드(@Override)
> Servlet에서는 **doGet()**, **doPost()** 를 오버라이드하여 코드를 작성합니다.
```java
@Override // 부모(HttpServlet)에 있는 메서드를 재정의
protected void doGet(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException, IOException {

    response.getWriter().println("GET 요청 처리!");
}
```

## 5. 생성자(Constructor) 와 메서드(Method)
| 구분    | 생성자        | 메서드               |
| ----- | ---------- | ----------------- |
| 이름    | 클래스 이름과 같음 | 아무 이름 가능          |
| 반환 타입 | 없음         | void/int/String 등 |
| 역할    | 객체 초기화     | 기능 수행             |

```java
public class User {
    String name;

    // 생성자
    public User(String name) {
        this.name = name;
    }

    // 메서드
    public void sayHello() {
        System.out.println("안녕하세요 " + name + "입니다.");
    }
}
```
> 생성자는 `new` 로 "객체가 만들어질 때 자동으로 실행되는 특별한 초기화 함수"

## 6. 추상 메서드 와 인터페이스
> Servlet 동작 원리에서 Filter, Listener 등을 만들 때 인터페이스 많이 사용됨.

1. 추상 메서드(abstract method)란?
    - “형태만 있고 내용이 없는 메서드”

    - 즉, 무조건 자식이 오버라이드해서 내용을 채워야 하는 메서드

        ```java
        abstract class Animal {
            // 추상 메서드 (몸체 { } 없음)
            public abstract void sound();

            // 일반 메서드 (몸체 있음)
            public void eat() {
                System.out.println("밥을 먹는다");
            }
        }
        ```
        > 추상 메서드가 있는 클래스는 반드시 추상 클래스가 되어야 함.


2. 인터페이스(interface)란?

    - “추상 메서드만 모아둔 완전한 설계도”

    - 클래스가 `implements` 로 구현할 때 “이 기능을 반드시 만들어라!” 라고 강제하는 역할

        ```java
        interface Animal {
            void sound();  // public abstract 가 자동으로 붙음 (추상 메서드)
            void eat();
        }
        ```

        ```java
        class Dog implements Animal {

            @Override
            public void sound() {
                System.out.println("멍멍!");
            }

            @Override
            public void eat() {
                System.out.println("개가 밥을 먹는다");
            }

        }
        ```


## 7. HttpServlet 구조 이해 (중요)
```java
public class MyServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html; charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h1>Hello Servlet</h1>");
    }
}
```
- `extends HttpServlet` → Servlet 클래스가 됨

- `@Override` → doGet/ doPost 기능 재정의

- `HttpServletRequest`, `HttpServletResponse` → 요청/응답 객체

- `PrintWriter` → 클라이언트에게 HTML, 텍스트 출력

## 💡 **요약정리**  

| 개념     | 키워드          | Servlet에서 어떻게 쓰는가?                   |
| ------ | ------------ | ------------------------------------ |
| 클래스    | `class`      | Servlet은 기본적으로 클래스                   |
| 객체     | `new`        | request, response 를 객체처럼 사용.<br>Tomcat(서버)이 만들어서 전달해줌.          |
| 상속     | `extends`    | `public class A extends HttpServlet` |
| 오버라이드  | `@Override`  | `doGet()` or `doPost()` 재정의          |
| 인터페이스  | `implements` | Filter, Listener 구현      |
| 패키지    | `package`    | `package com.example.servlet;`       |
| import | `import`     | `import jakarta.servlet.http.*;`  |
