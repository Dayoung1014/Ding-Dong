pipeline {
    agent any
    stages {
        stage("Set Variable") {
            steps {
                script {
                    IMAGE_NAME_BE = "dingdong-springboot-prod"
                    APPLICATION_YML_PATH = "/usr/spring/prod/resources"
                    CONTAINER_NAME_BE = "dingdong_be_prod"
                    PROJECT_DIR_BE = "backend"
                }
            }
        }

        // 설정파일 참조
        stage("COPY Resources") {
            steps {
                sh "cp -r ${APPLICATION_YML_PATH} ${PROJECT_DIR_BE}/src/main"
                sh "cp -r ${APPLICATION_YML_PATH} ${PROJECT_DIR_BE}/src/test"
            }
        }

        // 소나큐브 정적분석
        stage("SonaQube Analyze") {
            steps {
                // withSonarQubeEnv('SonarQube_BE_Production') {
                    sh """
                    cd ${PROJECT_DIR_BE}
                    chmod 777 ./gradlew
                    ./gradlew sonar \
                    -Dsonar.projectKey=dingdong_be_prod \
                    -Dsonar.projectName='dingdong_be_prod' \
                    -Dsonar.host.url=http://k9b203.p.ssafy.io:9000 \
                    -Dsonar.token=sqp_ee86a56ef5a6a0f02b69ebc5303a281a332b11fb
                    """
                // }
            }
        }
        
        // 백엔드 프로젝트 빌드
        stage("BE Build") {
            steps{
                sh """
                cd ${PROJECT_DIR_BE}
                chmod 777 ./gradlew
                ls -al
                pwd
                ./gradlew clean build
                """
            }
        }

        // 컨테이너 클리닝
        stage("Container Cleaning") {
            steps{
                sh "docker ps -q -f name=${CONTAINER_NAME_BE} | xargs --no-run-if-empty docker container stop"
                sh "docker container ls -a -q -f name=${CONTAINER_NAME_BE} | xargs --no-run-if-empty docker rm"
            }
        }

        // 이미지 삭제
        stage("Image Cleaning") {
            steps{
                sh "docker images ${IMAGE_NAME_BE} -q | xargs -r docker rmi -f"
            }
        }

        // 도커 이미지 빌드
        stage("BE Image Build") {
            steps {
                sh """
                    cd ${PROJECT_DIR_BE}
                    docker build --no-cache -t ${IMAGE_NAME_BE} .
                """
            }
        }

        // 컨테이너 실행
        stage("Be Container Run") {
            steps {
                sh "docker run -d -p 8082:8082 --name ${CONTAINER_NAME_BE} ${IMAGE_NAME_BE} -e TZ=Asia/Seoul"
            }
        }


        // 미사용 리소스 전부 삭제
        stage("Unused Resources Cleaning") {
            steps {
                sh "docker system prune -a -f"
            }
        }
    }
}