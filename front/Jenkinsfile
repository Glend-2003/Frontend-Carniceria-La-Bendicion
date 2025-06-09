pipeline {
    agent any

    stages {
        stage('Instalar') {
            steps {
                dir('front') {
                    bat 'npm install'
                }
            }
        }

        stage('Pruebas') {
            steps {
                dir('front') {
                    bat 'npm run test'
                }
            }
        }

        stage('Build') {
            steps {
                dir('front') {
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('front') {
                    // Aquí tu comando de despliegue
                }
            }
        }
    }

    post {
        success {
            emailext(
                subject: '✅ Pipeline exitoso',
                body: 'El pipeline se ejecutó correctamente.',
                to: 'degutierrezh02@gmail.com'
            )
        }
        failure {
            emailext(
                subject: '❌ Pipeline fallido',
                body: 'El pipeline falló en la etapa de instalación o posterior.',
                to: 'degutierrezh02@gmail.com'
            )
        }
    }
}
