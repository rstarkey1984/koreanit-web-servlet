# CDN 방식으로 바로 화면에 Vue 띄우기


## 📘 학습 개요
CDN 방식으로 바로 화면에 Vue 띄우기

## 💡 주요 내용

- 바닐라 JS에서 DOM 조작의 불편함 (querySelector, addEventListener 반복)

- 데이터가 바뀌면 화면을 자동으로 다시 그려주는 반응형(Reactivity) 개념 소개

- Vue는 “HTML + JS 연결을 편하게 해주는 프레임워크” 

## 1. Vue 소개
> Vue(발음: /vjuː/, view와 비슷함)는 사용자 인터페이스를 구축하기 위한 자바스크립트 프레임워크입니다. 표준 HTML, CSS, JavaScript 위에 구축되며, 선언적이고 컴포넌트 기반의 프로그래밍 모델을 제공하여 복잡도에 상관없이 효율적으로 사용자 인터페이스를 개발할 수 있도록 도와줍니다.

## 2. 바닐라 JavaScript vs Vue 비교

1. 바닐라 `Javascript`
    > DOM을 직접 찾아서 직접 수정해야 함.

    `/html/1.html`
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vanilla JS Counter</title>
    </head>
    <body style="text-align: center">
        <h1>카운터 (Vanilla JS)</h1>
        <p id="count">0</p>
        <button id="btn">+1</button>

        <script>
        const countEl = document.getElementById("count");
        const btn = document.getElementById("btn");

        let count = 0;

        btn.addEventListener("click", () => {
            count++;
            countEl.textContent = count; // ← 화면 직접 수정
        });
        </script>
    </body>
    </html>
    ```

    1. DOM 요소를 직접 찾는다

    2. 직접 UI를 업데이트 한다

    3. 코드가 점점 복잡해지고 유지보수 어려움

2. Vue 버전 (CDN 방식)
    > "데이터만 바꾸면 화면이 자동 업데이트" 됨.

    `/vue/1.html`
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vue 카운터</title>
        <!-- CDN: Vue 3 -->
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    </head>
    <body style="text-align: center">
        <div id="app" style="text-align: center">
        <h1>카운터 (Vue)</h1>
        <!-- 화면은 "데이터"에 자동으로 바인딩 -->
        <p>Count: {{ count }}</p>
        <button @click="increment">+1</button>
        </div>

        <script>
        const { createApp } = Vue;

        createApp({
            // 상태(state)는 data()에서 반환
            data() {
                return {
                    count: 0,
                };
            },
            // 동작(method)는 methods에 정의
            methods: {
                increment() {
                    this.count = this.count + 1; // 상태만 바꾸면, 화면은 자동으로 갱신됨
                },
            },
        }).mount("#app");
        </script>
    </body>
    </html>
    ```

    1. DOM을 직접 다룰 필요 없음

    2. count 값만 바꿔도 화면 자동 반영

    3. 코드가 훨씬 짧고 직관적임


    

## 3. Vue의 반응성(Reactivity)이란?
> 데이터를 변경하면 UI가 자동으로 업데이트되는 기능.

- 바닐라 JS
    ```
    count++
    document.getElementById('count').textContent = count
    ```

- Vue는?
    ```
    count.value++
    ```
    → UI 자동 업데이트

    즉, "데이터를 바꾸면 Vue가 알아서 화면 그려준다" 는 것.

    이 핵심을 가능하게 해주는 게 `ref()` / `reactive()` 같은 반응형 API.

    `ref()`, `reactivity`(반응성) 개념만 제대로 이해하면 `Vue`의 60%는 이해했다고 보면 됨.

    ### 1. `ref()` 는 무엇인가?
    > 하나의 값(value)을 반응형으로 감싸는 박스(Box). 즉, `Vue`가 감시할 수 있도록 값을 넣어놓은 객체.
    - 예:
        ```javascript
        import { ref } from 'vue'

        const count = ref(0)
        ```
    - 이 때 count는 그냥 숫자가 아니다.

        ```javascript
        count = { value: 0 } // 를 가진 반응형 객체
        ```
        - count 자체는 객체

        - 실제 값은 count.value 안에 들어 있음
        - 그래서 JS 코드에서는 count.value++ 라고 해야 함

    - 템플릿( {{ count }} )에서는 Vue가 알아서 .value를 붙여줌
        ```html
        <p>{{ count }}</p> --> p( null, toDisplayString(count.value) )
        ```