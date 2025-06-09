pipeline {
    agent any
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(1)
    }

    triggers {
        githubPush() // Activa el webhook de GitHub
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Instalar Dependencias') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci --silent'
                        } else {
                            bat 'npm ci --silent'
                        }
                    }
                }
            }
        }

        stage('Ejecutar Pruebas') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm run test -- --ci --watchAll=false --testResultsProcessor=jest-junit'
                        } else {
                            bat 'npm run test -- --ci --watchAll=false --passWithNoTests'
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        if (fileExists('front/junit.xml')) {
                            publishTestResults([
                                allowEmptyResults: false,
                                testResultsPattern: 'front/junit.xml'
                            ])
                        }
                    }
                }
            }
        }

        stage('Generar Reporte de Cobertura') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm run test:coverage -- --ci --watchAll=false --silent'
                        } else {
                            bat 'npm run test:coverage -- --ci --watchAll=false --silent'
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        if (fileExists('front/coverage/lcov.info')) {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'front/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Reporte de Cobertura'
                            ])
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Merge a main') {
            when {
                branch 'DEV-QA'
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-jenkins', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        bat """
                            git config user.name "jenkins"
                            git config user.email "jenkins@example.com"
                            git remote set-url origin https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/Glend-2003/Frontend-Carniceria-La-Bendicion.git
                            git checkout main
                            git pull origin main
                            git merge origin/DEV-QA -m "Merge automático desde DEV-QA"
                            git push origin main
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                dir('front') {
                    echo 'Desplegando aplicación...'
                    // Ejemplo de despliegue real:
                    // bat 'xcopy build\\* C:\\inetpub\\wwwroot\\ /E /Y'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            emailext(
                subject: "✅ Pipeline exitoso - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    El pipeline se ejecutó correctamente.
                    
                    Proyecto: ${env.JOB_NAME}
                    Build: #${env.BUILD_NUMBER}
                    Duración: ${currentBuild.durationString}
                    
                    Ver detalles: ${env.BUILD_URL}
                """,
                to: 'degutierrezh02@gmail.com'
            )
        }
        failure {
            emailext(
                subject: "❌ Pipeline fallido - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    El pipeline falló durante la ejecución.
                    
                    Proyecto: ${env.JOB_NAME}
                    Build: #${env.BUILD_NUMBER}
                    Error en etapa: ${env.STAGE_NAME}
                    
                    Ver logs: ${env.BUILD_URL}console
                """,
                to: 'degutierrezh02@gmail.com'
            )
        }
        unstable {
            emailext(
                subject: "⚠️ Pipeline inestable - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    El pipeline completó con advertencias.
                    
                    Revisar: ${env.BUILD_URL}
                """,
                to: 'degutierrezh02@gmail.com'
            )
        }
    }
}
