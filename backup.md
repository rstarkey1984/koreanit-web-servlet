## ⚙️ Node.js 설치 with nvm 

1. `nvm` ( Node Version Manager ) 설치 스크립트 실행
    > `nvm`은 여러 버전의 Node.js를 손쉽게 설치하고 전환할 수 있게 해주는 버전 관리 도구입니다.

    1. 홈 디렉터리로 이동:
        ```bash
        cd ~
        ```

    2. `nvm` 설치 스크립트 파일을 저장하지 않고 바로 실행:
        ```bash
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        ```

    3. 현재 쉘에 적용
        ```bash
        source ~/.bashrc
        ```

    4. nvm 설치확인
        ```bash
        nvm --version
        ```

2. `Node.js` 설치

    1. `LTS` 버전 설치
    
        > LTS 란? 소프트웨어나 프레임워크에서 오랫동안 안정적으로 지원(업데이트·보안 패치) 해주는 버전
        ```bash
        nvm install --lts
        ```

    2. 버전 확인
        ```bash
        node -v
        ```
        ```bash
        npm -v
        ```

    3. 🔁 Node.js 여러 버전 쓰기 ( 선택 )
        - 특정 버전 설치

            ```bash
            nvm install 20
            ```
        - 설치된 Node 버전 리스트
            ```bash
            nvm ls
            ```

        - 버전 변경
            ```bash            
            nvm use 20
            ```

        - 기본(default) 버전을 20으로 변경

            ```bash
            nvm alias default 20
            ```

        - 기본(default) 버전을 최신 lts 버전으로 변경

            ```bash
            nvm alias default lts/*
            ```