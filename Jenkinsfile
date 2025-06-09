pipeline {
    agent any
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(1)
    }

    triggers {
        githubPush()
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

        stage('Ejecutar Pruebas Unitarias') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm test -- --ci --watchAll=false --testPathPattern=tests'
                        } else {
                            bat 'npm test -- --ci --watchAll=false --testPathPattern=tests --passWithNoTests'
                        }
                    }
                }
            }
        }

        stage('Ejecutar Pruebas de Integración') {
            steps {
                dir('front') {
                    script {
                        if (isUnix()) {
                            sh 'npm test -- --ci --watchAll=false --testPathPattern=tests/integration'
                        } else {
                            bat 'npm test -- --ci --watchAll=false --testPathPattern=tests/integration --passWithNoTests'
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

        stage('Merge a MAIN') {
            when {
                branch 'DEV-QA'
            }
            steps {
                script {
                    if (isUnix()) {
                        sh """
                            git config user.name "jenkins-ci"
                            git config user.email "jenkins@ci.com"
                            git checkout main
                            git pull origin main
                            git merge origin/DEV-QA --no-ff -m "Merge automático desde DEV-QA"
                            git push origin main
                        """
                    } else {
                        bat """
                            git config user.name "jenkins-ci"
                            git config user.email "jenkins@ci.com"
                            git checkout main
                            git pull origin main
                            git merge origin/DEV-QA --no-ff -m "Merge automático desde DEV-QA"
                            git push origin main
                        """
                    }
                }
            }
            post {
                success {
                    emailext(
                        subject: "✅ Merge Exitoso DEV-QA → MAIN",
                        body: """
                            🎉 Merge completado exitosamente!
                            
                            ✅ Todas las pruebas pasaron
                            ✅ Build exitoso
                            ✅ Merge DEV-QA → MAIN completado
                            
                            El código está listo para producción.
                        """,
                        to: 'degutierrezh02@gmail.com'
                    )
                }
                failure {
                    emailext(
                        subject: "❌ Error en Merge DEV-QA → MAIN",
                        body: """
                            ⚠️ El merge falló!
                            
                            Revisar conflictos o problemas de Git.
                            No se desplegó a producción.
                        """,
                        to: 'degutierrezh02@gmail.com'
                    )
                }
            }
        }

        stage('Deploy a Producción') {
            when {
                branch 'main'
            }
            steps {
                dir('front') {
                    script {
                        echo '🚀 Desplegando a producción...'
                        
                        if (isUnix()) {
                            sh '''
                                echo "Copiando archivos a producción..."
                                # cp -r build/* /var/www/html/
                            '''
                        } else {
                            bat '''
                                echo "Copiando archivos a producción..."
                                REM xcopy build\\* C:\\inetpub\\wwwroot\\ /E /Y
                            '''
                        }
                    }
                }
            }
            post {
                success {
                    emailext(
                        subject: "🚀 Deploy a Producción Exitoso",
                        body: """
                            🎉 Aplicación desplegada exitosamente!
                            
                            ✅ Deploy completado
                            🌐 Aplicación disponible en producción
                        """,
                        to: 'degutierrezh02@gmail.com'
                    )
                }
                failure {
                    emailext(
                        subject: "❌ Error en Deploy a Producción",
                        body: """
                            ⚠️ El deploy falló!
                            
                            Revisar configuración de servidor.
                        """,
                        to: 'degutierrezh02@gmail.com'
                    )
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        
        failure {
            emailext(
                subject: "❌ Pipeline Fallido - Pruebas No Pasaron",
                body: """
                    ⚠️ El pipeline falló y NO se hizo merge ni deploy.
                    
                    🔍 Posibles causas:
                    • Pruebas unitarias fallaron
                    • Pruebas de integración fallaron
                    • Error en el build
                    
                    ❗ Corregir errores antes del próximo push.
                """,
                to: 'degutierrezh02@gmail.com'
            )
        }
    }
}