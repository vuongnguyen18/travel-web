pipeline {
  agent any
  parameters {
    booleanParam(name: 'GO_PROD', defaultValue: false, description: 'Also deploy prod on 8082')
    booleanParam(name: 'SECURITY_ENFORCE', defaultValue: false, description: 'Fail build on HIGH/CRITICAL findings')
  }
  environment {
    DOCKER_BUILDKIT = '1'
    SONAR_HOST_URL  = 'http://host.docker.internal:9000'
    // set SONAR_TOKEN as a Jenkins credential and reference in withCredentials
  }
  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build & Test (API)') {
      steps {
        bat 'npm --prefix api ci || npm --prefix api install'
        bat 'npm --prefix api test'
      }
      post {
        always {
          junit 'api/junit.xml'
          archiveArtifacts artifacts: 'api/coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('Code Quality (SonarQube)') {
      steps {
        withCredentials([string(credentialsId: 'SONAR_TOKEN_ID', variable: 'SONAR_TOKEN')]) {
          bat '''
          docker run --rm ^
            -e SONAR_HOST_URL=%SONAR_HOST_URL% ^
            -e SONAR_TOKEN=%SONAR_TOKEN% ^
            -v "%CD%":/usr/src ^
            sonarsource/sonar-scanner-cli:5
          '''
        }
      }
    }

    stage('Docker Build (web & api)') {
      steps {
        bat 'docker build -t travel-web-api:staging -f api/Dockerfile .'
        bat 'docker build -t travel-web-web:staging -f Dockerfile.web .'
      }
    }

    stage('Security: Trivy (FS)') {
      steps {
        bat '''
          if not exist .trivy-cache mkdir .trivy-cache
          docker run --rm ^
            -v "%CD%":/src ^
            -v "%CD%\\.trivy-cache":/root/.cache/trivy ^
            aquasec/trivy:0.54.1 fs /src ^
            --scanners vuln,misconfig,secret ^
            --ignore-unfixed ^
            --skip-dirs /src/**/node_modules,/src/.git,/src/**/coverage ^
            --severity HIGH,CRITICAL ^
            --format table ^
            --output /src/trivy-fs.txt ^
            --exit-code 0
        '''
      }
      post { always { archiveArtifacts 'trivy-fs.txt' } }
    }

    stage('Security: Trivy (Images)') {
      steps {
        script {
          def exitCode = params.SECURITY_ENFORCE ? 1 : 0
          bat """
            docker run --rm -v //var/run/docker.sock:/var/run/docker.sock ^
              -v "%CD%\\.trivy-cache":/root/.cache/trivy ^
              -v "%CD%":/out aquasec/trivy:0.54.1 image travel-web-api:staging ^
              --ignore-unfixed --severity HIGH,CRITICAL --format table --output /out/trivy-api.txt --exit-code ${exitCode}
            docker run --rm -v //var/run/docker.sock:/var/run/docker.sock ^
              -v "%CD%\\.trivy-cache":/root/.cache/trivy ^
              -v "%CD%":/out aquasec/trivy:0.54.1 image travel-web-web:staging ^
              --ignore-unfixed --severity HIGH,CRITICAL --format table --output /out/trivy-web.txt --exit-code ${exitCode}
          """
        }
      }
      post { always { archiveArtifacts 'trivy-*.txt' } }
    }

    stage('SBOM (CycloneDX)') {
      steps {
        bat '''
          docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v "%CD%":/out aquasec/trivy:0.54.1 image travel-web-api:staging --format cyclonedx --output /out/sbom-api.cdx.json
          docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v "%CD%":/out aquasec/trivy:0.54.1 image travel-web-web:staging --format cyclonedx --output /out/sbom-web.cdx.json
        '''
      }
      post { always { archiveArtifacts 'sbom-*.cdx.json' } }
    }

    stage('Deploy: Staging (Compose)') {
      steps {
        bat 'docker compose -f docker-compose.staging.yml up --build -d --remove-orphans'
        bat 'for /L %i in (1 1 30) do (curl.exe -sf http://localhost:8083/health 1>nul 2>&1 && (echo Smoke test OK & exit /b 0) & ping -n 2 127.0.0.1 >nul)'
      }
    }

    stage('Release: Production (Compose)') {
      when { expression { return params.GO_PROD == true } }
      steps {
        echo 'Add a docker-compose.production.yml if you want to mirror staging on 8082.'
      }
    }
  }
}
