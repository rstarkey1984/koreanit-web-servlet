<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %> <%@
taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <c:set var="pageTitle" value="MySite - 환영합니다!" />
    <%@ include file="/WEB-INF/view/layout/head.jsp" %>
  </head>
  <body>
    <%@ include file="/WEB-INF/view/layout/header.jsp" %>
    <div class="main-content">
      <div class="wrapper">
        <div class="card">
          <div class="title">로그인 성공 🎉</div>
          <div class="subtitle">
            안녕하세요, <strong>${sessionScope.id}</strong> 님! <br />
            오늘도 좋은 하루 보내세요 ☀️
          </div>

          <div class="form-group">
            <a href="/user/login"
              ><button type="button">로그인으로 돌아가기</button></a
            >
          </div>

          <div class="form-group">
            <a href="/user/logout"><button type="button">로그아웃</button></a>
          </div>
        </div>
      </div>
    </div>

    <%@ include file="/WEB-INF/view/layout/footer.jsp" %>
  </body>
</html>
