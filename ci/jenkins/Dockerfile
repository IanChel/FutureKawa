# =============================================================================
#  Image Jenkins « prête à l'emploi » pour démontrer la CI de FutureKawa.
#  Basée sur Jenkins LTS (JDK 21) + Node 20, avec les plugins nécessaires et
#  le job de pipeline déjà configuré (lecture du Jenkinsfile depuis le dépôt).
# =============================================================================
FROM jenkins/jenkins:lts-jdk21

USER root

# Node.js 20 (pour les tests et le build du front-end). Git est déjà présent.
RUN apt-get update \
 && apt-get install -y curl ca-certificates gnupg \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
 && apt-get update && apt-get install -y nodejs \
 && rm -rf /var/lib/apt/lists/*

# Le dépôt est monté en volume (propriétaire = hôte) : on le déclare « sûr »
# pour éviter l'erreur Git « dubious ownership » lors du checkout.
RUN git config --system --add safe.directory '*'

# Plugins Jenkins (pipeline, git, publication JUnit, vue par étapes)
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Job de pipeline pré-créé (copié dans JENKINS_HOME au premier démarrage)
COPY jobs/FutureKawa-CI/config.xml /usr/share/jenkins/ref/jobs/FutureKawa-CI/config.xml

# Démarrage direct (pas d'assistant de configuration) pour une démo simple.
# ALLOW_LOCAL_CHECKOUT : autorise le checkout depuis le dépôt monté (file:///repo).
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true"

USER jenkins
