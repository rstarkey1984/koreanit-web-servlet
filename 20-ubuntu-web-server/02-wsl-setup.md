# WSL Ubuntu 를 실제 개발서버 접속과 동일하게 구성하기

## 📘 학습 개요
WSL Ubuntu 를 실제 개발서버와 동일하게 설정하기 위해 윈도우 디렉터리를 언마운트 하고 SSH 접속방식으로 변경한다.

- 아래 단계를 진행하기 전,
   - VSCode [Remote - SSH ( Extension )](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) 설치
   - Ubuntu 서버 hosts, hostname 체크

## 💡 주요 내용
- WSL Ubuntu 인스턴스의 의미
- WSL Ubuntu 에서 윈도우 디렉토리 언마운트(= DrvFS 끄기)
- Ubuntu 에서 OpenSSH SSH Server 설정
- VSCode 로 Ubuntu 서버로 SSH 접속

---

### 1. WSL Ubuntu 인스턴스의 의미
> Ubuntu 배포판을 기반으로 만든 WSL 인스턴스 
    
- 인스턴스란? 가상화 기술로 실행되는 하나의 독립된 운영체제 환경. 대표적으로 AWS(아마존 웹 서비스) 랑 GCP(구글 클라우드 플랫폼) 에서 클라우드 서비스로 제공해준다.

    - AWS 인스턴스 생성 화면 
        ![AWS 인스턴스 생성 화면 ](https://lh3.googleusercontent.com/d/1sUYUMs8RqBiftkaKWfCYxGjERLd_JSAM)


### 2. WSL Ubuntu 에서 윈도우 디렉토리 언마운트(= DrvFS 끄기)
> DrvFS 끄기 : Windows 파일 시스템(C:, D: 같은 드라이브)을 WSL(Ubuntu 등)에 자동으로 마운트하지 않도록 설정하는 것을 의미합니다.

1.  `/etc/wsl.conf` 파일 내용 수정 ( `<hostname>`은 본인의 hostname 으로 수정 )

    ```bash
    sudo sh -c 'cat > /etc/wsl.conf << "EOF"
    [boot]
    systemd = true           # ssh 등 systemd 서비스 사용하려면 권장

    [automount]
    enabled = false          # /mnt/c 같은 자동 마운트 중지
    mountFsTab = true        # /etc/fstab 사용 시에만 마운트

    [interop]
    enabled = false          # 윈도우 exe 실행 금지
    appendWindowsPath = false # 윈도우 PATH 섞기 끄기

    [network]
    generateHosts=false # WSL Ubuntu를 실행할 때, `/etc/hosts` 파일을 자동으로 덮어쓰지 않기 위해 설정합니다.
    hostname=<hostname> # WSL Ubuntu 에서 사용할 hostname  
    EOF'
    ```
    - `sudo sh -c ''` : “루트 권한으로 셸을 실행하면서, 뒤에 오는 명령 전체를 하나의 문자열로 실행” 하겠다는 의미입니다.
    - `cat > /etc/wsl.conf << "EOF"` 는 리눅스에서 특정 파일을 여러 줄 입력으로 한 번에 생성/덮어쓸 때 사용하는 방식입니다.
        ```
        cat > /etc/wsl.conf << "EOF"
        (여기에 입력할 내용들...)
        EOF
        ```

2. /etc/wsl.conf 수정내용 확인
    ```bash
    cat /etc/wsl.conf
    ```
    - cat <파일이름> : 가장 많이 쓰이는 명령어 중 하나이며 파일 내용을 화면에 출력해줍니다.

        ```
        [boot]
        systemd = true           # ssh 등 systemd 서비스 사용하려면 권장

        [automount]
        enabled = false          # /mnt/c 같은 자동 마운트 중지
        mountFsTab = true        # /etc/fstab 사용 시에만 마운트

        [interop]
        enabled = false          # 윈도우 exe 실행 금지
        appendWindowsPath = false # 윈도우 PATH 섞기 끄기

        [network]
        generateHosts=false # WSL Ubuntu를 실행할 때, `/etc/hosts` 파일을 자동으로 덮어쓰지 않기 위해 설정합니다.
        hostname=<hostname> # WSL Ubuntu 에서 사용할 hostname        
        ```

3. Ubuntu 에서 접속 종료 
    ```bash
    exit
    ```

4. WSL Ubuntu 인스턴스 종료 후 접속
    ```Powershell
    > wsl --shutdown

    > wsl
    ```

5. `Powershell` 이 존재하는지 확인
    ```bash
    which powershell.exe
    ```
    - 아무것도 나오지 않으면 정상

    

    
## 3. Ubuntu 에서 OpenSSH Server 설정

-  SSH 란?

    > SSH(Secure Shell)은 네트워크를 통해 다른 컴퓨터에 안전하게 접속하고 명령을 실행할 수 있게 해주는 보안 프로토콜이자 프로그램입니다.

    | 기능            | 설명                                           |
    | ------------- | -------------------------------------------- |
    | **원격 접속**     | 다른 컴퓨터(서버 등)에 접속해 명령어를 실행할 수 있음              |
    | **암호화된 통신**   | ID, 비밀번호, 데이터 등을 암호화해서 주고받기 때문에 도청·중간자 공격 방지 |
    | **인증 방식**     | 비밀번호 방식 또는 공개키/개인키 방식으로 인증                   |
    | **포트 번호 기본값** | 기본 포트는 `22번`                                 |

- SSH 접속을 위한 서버 환경 설정 ( 클라우드 인스턴스서버 에서는 이 과정이 이미 완료되어 있음 )

    1. OpenSSH 설치:
        > OpenSSH(Open Secure Shell)는 SSH(Secure Shell) 프로토콜을 구현한 오픈소스 소프트웨어 패키지입니다.
    
        ```bash
        sudo apt install openssh-server
        ```
    
    2. 설치확인:
        ```bash
        sudo systemctl status ssh
        ```

        - OpenSSH Server 포트 변경 ( 윈도우에서 이미 22 포트를 사용 중일때 )

            1. /etc/ssh/sshd_config 파일 열기
            2. Port 2222 로 수정             
            3. `sudo systemctl stop ssh`
            4. `sudo systemctl stop ssh.socket`
            5. `sudo systemctl restart ssh`
            6. ssh 접속할때는 포트 지정 ( 예: ssh -p 2222 사용자@localhost )

    3. Ubuntu 부팅 시 ssh 서버 자동으로 시작:
        ```bash
        sudo systemctl enable ssh
        ```
        

    4. `ssh` 접속 테스트 ( 윈도우에서 )
        > WSL은 localhost 로 요청시 자동으로 포트가 열려있는 인스턴스로 IP 포워딩 해줌. ( 단 외부에서 접속시 포트포워딩 필요함 )

        - OpenSSH 설치확인:
            ```Powershell
            > ssh -V
            ```
            - 윈도우에서 OpenSSH 없을경우
                1. 설정 → 앱 → 선택적 기능 
                2. 목록에서 OpenSSH Client와 OpenSSH Server를 찾아 설치
                3. 만약 없으면 "사용 가능한 기능" 클릭 후 검색하여 설치

        - 기본 접속 방식:

            ```bash
            ssh <사용자이름>@localhost -p <포트번호>
            ```

    5. SSH 키 페어 기반 접속 설정 ( 보안상 추천되는 방식 ) 
        > SSH 접속 시 비밀번호 대신 공개키(서버에 저장) + 비공개키(클라이언트에 저장) 조합으로 인증하는 방식입니다.

        > 아래는 윈도우 `Powershell` 에서 진행
        - SSH 키 페어 생성
            ```Powershell
            > ssh-keygen -C "<코멘트>" -f "$env:USERPROFILE\.ssh\<키이름>"
            ```
            - passphrase 입력하라고 뜨는데, 무시하고 두번 엔터 ( passphrase는 비밀키를 보호하기 위해 사용하는 추가 비밀번호 )
            - `ssh-keygen` 명령어는 SSH 연결에 사용할 **공개키(public key)와 비공개키(private key)** 를 생성하는 도구입니다. SSH 인증 방식 중 **비밀번호 없이 안전하게 인증하는 방식** 을 만들 때 사용됩니다.             

        - 공개키랑 비공개키 생성 확인
            ```Powershell
            ls ~/.ssh/
            ```
            - .pub 확장자를 가진 파일이 공개키임

        - Ubuntu 서버에 공개키 등록

            - 공개키를 등록할 파일 생성 
                ```
                touch ~/.ssh/authorized_keys
                ```
            - 권한 변경
                ```
                chmod 600 ~/.ssh/authorized_keys
                ```
            - `nano` 명령어로 파일을 편집기 형태로 연다음 윈도우에 있는 .pub 파일 복사해서 붙여넣기
                ```
                nano ~/.ssh/authorized_keys
                ```

                - `nano`는 Ubuntu에서 많이 사용하는 간단하고 직관적인 텍스트 편집기입니다.

                - 붙여넣기 한다음 순서대로 
                    1. `Ctrl` + `X`
                    2. `Y`
                    3. `엔터`

        - 윈도우에서 비밀번호 없이 비공개키를 이용해 SSH 접속
            ```Powershell
            > ssh -i "$env:USERPROFILE\.ssh\<키이름>" ubuntu@localhost
            ```
            - 포트번호가 다르다면 `-p <포트번호>` 추가

    6. 윈도우에서 SSH config 설정하기 ( 자주 접속하는 서버일 경우 )
        
        - `C:\User\<사용자>\.ssh\config` 파일을 열어서, ( 없다면 생성 )
            ```
            Host <별칭>
                HostName localhost
                IdentityFile C:\Users\<윈도우사용자이름>\.ssh\<키이름>
                User ubuntu
            ```
            - Powershell 에서 pwd 이용 하면 편함
                1. `cd ~/.ssh/`
                2. `pwd`
                3. 출력결과를 키 이름 앞에 붙여넣기.

        - ssh 접속
            ```bash
            ssh <별칭>
            ```


## 4. VSCode 로 Ubuntu 서버로 SSH 접속

1. 왼쪽에 Remote Explorer 클릭

    ![VSCode Remote SSH1](https://lh3.googleusercontent.com/d/1ACbjDph3R1siAALQST_ACeXkcvg6CV_r)

2. 왼쪽에 Open Folder 클릭 -> 상단에 기본값으로 사용자 디렉터리가 입력되어 있음. -> 엔터


    ![VSCode Remote SSH2](https://lh3.googleusercontent.com/d/1jZ_CkskvkfukHv_5Il1nAo2wmMmC3ISf)