# 컴포넌트 기반 UI 개발 및 API 데이터 렌더링


## 📘 학습 개요

이번 수업에서는 Vue 3의 Composition API + 컴포넌트(Component) 기반 개발 방식을 익히고,
이를 실제 **서블릿 API(백엔드)**와 연결하여 데이터를 렌더링하는 실습을 진행한다.

Vue의 핵심 철학은 “화면을 작은 컴포넌트로 나누고, 데이터 흐름을 명확하게 설계하는 것”이다.
이 실습을 통해 SPA(Single Page Application) 구조를 자연스럽게 이해하게 된다.

## 💡 주요 내용

- 컴포넌트 기반 UI 개념 이해

- Vue Composition API 기본 구조

- 컴포넌트 만들기 실습

- 더미 데이터로 UI 렌더링

- 진짜 API와 연결하기 (서블릿 + JSON)

- 컴포넌트 간 상태·이벤트 통합

- SPA 흐름 완성하기


## 1. 컴포넌트 기반 UI 개념 이해

UI를 작은 조각(컴포넌트)으로 분리하는 이유

유지보수성 · 재사용성 · 가독성이 좋아짐

“부모 ↔ 자식” 데이터 흐름 (props / emits)

## 2. Vue Composition API 기본 구조

setup() 함수의 역할

ref, reactive, computed 의 차이

템플릿에서 반응형 데이터 사용하기

## 3. 컴포넌트 만들기 실습

`<template>`로 뷰 분리하기

전역 컴포넌트 등록 (app.component())

부모 → 자식 데이터 전달 (props)

자식 → 부모 이벤트 전달 (emit)

## 4. 더미 데이터로 UI 렌더링

API 없이 static 배열로 목록 렌더링

페이지네이션, 버튼 클릭 처리

**“기능은 있지만 API는 없는 상태”**로 UI 구조부터 완성

## 5. 진짜 API와 연결하기 (서블릿 + JSON)

fetch() 또는 jsonFetch() 헬퍼 사용

GET / POST / PUT / DELETE API 호출 방식

서버 응답 데이터 → 컴포넌트 렌더링

로딩 상태 / 에러 상태 표현

## 6. 컴포넌트 간 상태·이벤트 통합

Auth(로그인/회원가입) 컴포넌트

Board List 컴포넌트

Board Form 컴포넌트

전체 앱(App) 컴포넌트에서 상태 관리

## 7. SPA 흐름 완성하기

onMounted()에서 초기 데이터 로딩

localStorage로 로그인 상태 유지

새로고침해도 SPA 동작 유지되도록 구성