// =============================================================================
//  FutureKawa — Pipeline d'intégration continue (Jenkins, déclaratif)
// -----------------------------------------------------------------------------
//  Étapes : compilation + tests des deux back-ends (via le wrapper Maven),
//  tests du front-end (Vitest), packaging (JARs + build front), construction
//  des images Docker des back-ends, puis archivage des artefacts. Les
//  résultats de tests JUnit sont publiés.
//
//  Pré-requis de l'agent : JDK 21, Node 20, Git, CLI Docker (avec accès au
//  socket Docker). L'image Jenkins fournie dans ci/jenkins/ embarque tout le
//  nécessaire ; le socket est monté au lancement (voir ci/jenkins/README.md).
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

        stage('Images Docker') {
            steps {
                // Images « runtime » construites À PARTIR DES JAR déjà packagés
                // à l'étape précédente (Dockerfile.ci) : pas de recompilation
                // Maven, build en quelques secondes. $BUILD_NUMBER injecté par Jenkins.
                sh 'docker build -f backend-pays/Dockerfile.ci -t futurekawa/backend-pays:$BUILD_NUMBER -t futurekawa/backend-pays:latest backend-pays'
                sh 'docker build -f backend-central/Dockerfile.ci -t futurekawa/backend-central:$BUILD_NUMBER -t futurekawa/backend-central:latest backend-central'
                sh "docker image ls --filter=reference='futurekawa/*'"
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'backend-pays/target/*.jar, backend-central/target/*.jar, front-end/dist/**',
                             fingerprint: true, allowEmptyArchive: true
            echo '✅ BUILD VERT — tests (back + front), packaging et images Docker réussis.'
        }
        failure {
            echo '❌ BUILD ÉCHOUÉ — voir l\'étape en erreur ci-dessus.'
        }
    }
}
