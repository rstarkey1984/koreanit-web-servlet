# WSL로 리눅스 서버 개발환경 구축 ( WSL + Ubuntu + JDK )


## 📘 학습 개요
Windows 환경에서 WSL( Windows Subsystem Linux ) 을 활용해 리눅스 서버 개발환경 구성하기

- 아래 단계를 진행하기 전 `VSCode`가 없다면,
   - https://code.visualstudio.com/ 에서 설치
   - 확장 프로그램 설치
      - https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl
      - https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack

## 💡 주요 내용
- WSL( Windows Subsystem Linux ) 소개 및 설치과정

- Ubuntu 소개 및 설치과정

- JDK 소개 및 설치과정

---

## 1. WSL ( Windows Subsystem for Linux )

-  WSL 이란?
   >**WSL** 은 윈도우(Windows) 안에서 리눅스(Linux)를 그대로 사용할 수 있게 해주는 기능입니다. 듀얼 부팅이나 가상머신 없이도 Windows에서 리눅스 명령어, 터미널, 패키지를 사용할 수 있는 환경을 제공합니다.

- 설치하기 

   - 시작 메뉴에서 `PowerShell`을 검색하고, **"관리자 권한으로 실행"** 을 선택합니다.

   - 아래 명령으로 WSL을 실행하는 데 필요한 모든 항목을 설치할 수 있습니다:
      ```Powershell
      > dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

      > dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

      > wsl --install
      ```

   - PC 재시작 활성화 후 컴퓨터를 재시작합니다.

   - 재시작이 완료되면 명령프롬프트가 자동으로 열리며 기본 Ubuntu 배포판을 설치합니다.

   - 설치가 완료되면 사용자 이름과 비밀번호를 설정해야 합니다. 

      실습시 용이하게 아래와 같이 ubuntu / ubuntu 로 아이디 패스워드를 설정합니다.

      ![아이디패스워드입력](https://lh3.googleusercontent.com/d/1n87lsF_ChuQIRtmV36s4EsSsELtsrd3D)

## 2. Ubuntu 

- Ubuntu 란?
   > **Ubuntu**는 Debian 기반의 Linux 운영체제로, 무료이며 누구나 사용 가능한 오픈소스 OS입니다.
사용하기 쉽고 설치가 간단해서 리눅스 입문자부터 서버 개발자, 클라우드, AI, WSL 사용자까지 널리 사용됩니다.

- 설치하기 ( 선택 )

   1. **Microsoft Store**에서 원하는 리눅스 배포판 다운로드
      - 윈도우 검색(⊞키)에서 [ **Microsoft Store** ]를 검색해서 선택
      - [ **Microsoft Store** ]에서 [ **Ubuntu 24.04.1 LTS** ] 을 검색하여 설치합니다. ( Windows 앱으로 등록 )

         ![아이디패스워드입력](https://lh3.googleusercontent.com/d/1caYsHx5aU1NCjlqJgvKR162_i3LALQeD)


   2. **WSL**에 배포판 등록
      - 스토어에서 Open(열기) 를 누르거나 시작 메뉴에서 “Ubuntu”를 처음 실행하면, 다음이 자동으로 진행됩니다.

         A. 배포판 초기화(자동)

         B. 기본 유닉스 사용자 만들기(반드시 수행)

         ![아이디패스워드입력](https://lh3.googleusercontent.com/d/1n87lsF_ChuQIRtmV36s4EsSsELtsrd3D)

         이 단계에서 생성된 계정이 기본 로그인 사용자가 됩니다.
         (나중에 ubuntu config --default-user <user> 로 바꿀 수 있음)
      

- Ubuntu 서버 설정:

   - `Powershell`에서 Ubuntu 서버 접속:
      ```Powershell
      > wsl
      ```
   - Windows의 드라이브(C:) 의 /mnt/c 경로로 가는걸 방지: ( ~/.bashrc 파일 수정 )
      ```bash
      echo 'cd ~' >> ~/.bashrc
      ```
   - hostname을 바꾸기 위해 `/etc/wsl.conf` 설정파일 수정:
      ```bash
      sudo sh -c 'cat > /etc/wsl.conf << "EOF"
      [boot]
      systemd=true

      [user]
      default=ubuntu

      [network]
      hostname=ubuntu-webserver
      generateHosts=false
      EOF'
      ```
      수정된 `/etc/wsl.conf` 파일내용 확인:
      ```bash
      cat /etc/wsl.conf
      ```
      ```
      [boot]
      systemd=true

      [user]
      default=ubuntu

      [network]
      hostname=ubuntu-webserver
      generateHosts=false
      ```
         
      - `systemd=true` : Ubuntu 부팅시 자동으로 `systemd`에 등록된 서비스(웹서버,디비서버 등) 시작하려면 `true` 아니면 `false`

      - `default=ubuntu` : Ubuntu Shell 접속시 자동으로 로그인 할 사용자 이름입니다.

      - `hostname=ubuntu-webserver` : WSL 환경에서 Ubuntu를 실행할 때, 시스템이 부팅 과정에서 `/etc/hostname` 파일을 자동으로 다시 생성합니다. 이 때문에 고정된 호스트 이름을 사용하려면 `/etc/wsl.conf` 파일에서 호스트 이름을 지정해야 합니다.

      - `generateHosts=false` : WSL 환경에서 Ubuntu를 실행할 때, `/etc/hosts` 파일을 자동으로 덮어쓰지 않기 위해 설정합니다.

   - hostname을 해석 할 수 있도록 `/etc/hosts` 파일에 ubuntu-web 내용 추가:
      ```bash
      echo "127.0.0.1   ubuntu-webserver" | sudo tee -a /etc/hosts > /dev/null
      ```
   - wsl 접속종료:   
      ```bash
      exit
      ```
   - wsl 모든 배포판 실행 중지:
      ```bash
      > wsl --shutdown
      ```
   - wsl 재연결:
      ```
      > wsl
      ```
   - 명령 프롬프트가 나오면 설정완료 : `ubuntu@ubuntu-webserver:~$`


## 3. JDK 

- JDK란? (Java Development Kit)
   > **JDK는 Java 프로그램을 만들기 위해 필요한 도구들의 모음(개발 도구 세트)** 입니다.
   즉, Java로 개발하려면 반드시 설치해야 하는 소프트웨어입니다.

   | 구성 요소                              | 역할                                                      |
   | ---------------------------------- | ------------------------------------------------------- |
   | **JRE (Java Runtime Environment)** | 자바 프로그램을 실행할 수 있는 환경 (JDK 안에 포함됨)                       |
   | **JVM (Java Virtual Machine)**     | 자바 코드를 실행하는 가상 머신                                       |
   | **컴파일러 (`javac`)**                 | 사람이 작성한 `.java` 파일 → 컴퓨터가 이해할 수 있는 `.class` 파일로 변환      |
   | **실행기 (`java`)**                   | `.class` 파일을 실행                                         |
   | **개발 도구들 (디버거, 문서 생성기 등)**         | 코드 오류 찾기(`jdb`), API 문서 생성(`javadoc`) 등 개발을 위한 다양한 유틸리티 |


- 설치하기 ( `apt`를 이용해 openjdk 설치 )
   > `apt` 명령어는 리눅스 패키지 도구로써 웹서버,디비서버 등 다양한 패키지들을 쉽게 설치 하도록 도와줍니다.

   1. 패키지 목록 갱신 및 업그레이드:

      ```bash      
      sudo apt update && sudo apt upgrade -y
      ```

   2. 설치 가능한 JDK 버전 확인:
      ```bash
      apt search openjdk
      ```

   3. OpenJDK 21 설치:
      > Java 언어의 오픈소스 공식 개발 도구 세트(JDK)
      ```bash
      sudo apt install -y openjdk-21-jdk
      ```

   4. 설치 확인:
      ```bash
      java -version
      ```

      `openjdk version "21.0.8" 2025-07-15`

      `OpenJDK Runtime Environment (build 21.0.8+9-Ubuntu-0ubuntu124.04.1)`

      `OpenJDK 64-Bit Server VM (build 21.0.8+9-Ubuntu-0ubuntu124.04.1, mixed mode, sharing)`

   
   5. JDK 설치목록 확인 및 선택:

         ```bash
         update-alternatives --config java
         ```
   

## 💡 **요약정리**  
> 1. WSL은 Windows에서 Ubuntu 같은 리눅스를 쉽고 빠르게 사용할 수 있게 해주는 기능입니다.
> 2. JDK는 자바 프로그램을 개발하고 실행할 수 있게 해주는 개발 도구 모음입니다.

## 🧩 실습 / 과제
- `Powershell`로 WSL 현재 설치된 배포판과 현재 상태가 어떤지 확인

- 설치된 배포판에 접속해서 `java --version` 실행 결과 확인


## 참고) WSL 과 Ubuntu 주요 명령어들 

- WSL 설치 목록 확인   
   ```Powershell
   > wsl -l -v
   ```
   ![배포판설치목록](https://lh3.googleusercontent.com/d/1GT6QyWCIvOG1qMInKMxMxKaGt4iWeCWG)

- WSL 기본 배포판 접속
   ```Powershell
   > wsl
   ```

- WSL 실행 기본 배포판 선택
   ```Powershell
   > wsl --set-default Ubuntu-24.04
   ```

- WSL 배포판 실행 중지
   ```Powershell
   > wsl --shutdown # 전체

   > wsl --terminate Ubuntu-24.04 # 특정 배포판만
   ```

- WSL 배포판 실행 및 접속
   ```Powershell
   > wsl -d Ubuntu-24.04
   ```

- WSL 특정 배포판 삭제
   ```Powershell
   > wsl --unregister Ubuntu-24.04
   ```

- WSL 메모리 사용량 확인
   ```Powershell
   > wsl -e free -h
   ```

- WSL 사용자 비밀번호 재설정
   ```powershell
   > wsl -u root
   ```
   ```bash
   $ passwd 사용자계정
   ```

- WSL2를 기본 버전으로 설정:
   ```powershell
   > wsl --set-default-version 2
   ```

- ubuntu 사용자 추가
   ```bash
   sudo adduser ubuntu && usermod -aG sudo ubuntu && su - ubuntu
   ```


