// =============================================================================
//  FutureKawa — Pipeline d'intégration continue (Jenkins, déclaratif)
// -----------------------------------------------------------------------------
//  Étapes : compilation + tests des deux back-ends (via le wrapper Maven),
//  tests du front-end (Vitest), puis packaging (JARs + build front) et
//  archivage des artefacts. Les résultats de tests JUnit sont publiés.
//
//  Pré-requis de l'agent : JDK 21, Node 20, Git. (L'image Jenkins fournie dans
//  ci/jenkins/ embarque tout le nécessaire.)
// =============================================================================

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Tests — back-end pays') {
            steps {
                dir('backend-pays') {
                    sh 'chmod +x mvnw'
                    sh './mvnw -B test'
                }
            }
            post {
                always {
                    junit testResults: 'backend-pays/target/surefire-reports/*.xml',
                          allowEmptyResults: true
                }
            }
        }

        stage('Tests — back-end central') {
            steps {
                dir('backend-central') {
                    sh 'chmod +x mvnw'
                    sh './mvnw -B test'
                }
            }
            post {
                always {
                    junit testResults: 'backend-central/target/surefire-reports/*.xml',
                          allowEmptyResults: true
                }
            }
        }

        stage('Tests — front-end') {
            steps {
                dir('front-end') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Packaging') {
            steps {
                dir('backend-pays')    { sh './mvnw -B -DskipTests package' }
                dir('backend-central') { sh './mvnw -B -DskipTests package' }
                dir('front-end')       { sh 'npm run build' }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'backend-pays/target/*.jar, backend-central/target/*.jar, front-end/dist/**',
                             fingerprint: true, allowEmptyArchive: true
            echo '✅ BUILD VERT — tests (back + front) et packaging réussis.'
        }
        failure {
            echo '❌ BUILD ÉCHOUÉ — voir l\'étape en erreur ci-dessus.'
        }
    }
}
