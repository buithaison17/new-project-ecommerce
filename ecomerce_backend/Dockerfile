# Stage 1: Build Spring Boot application
FROM gradle:9.8.1-jdk17-alpine AS build
WORKDIR /app
# Copy Gradle configuration
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
# Copy source code
COPY src ./src
# Build executable JAR
RUN chmod +x gradlew && ./gradlew clean bootJar --no-daemon
# Stage 2: Run application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]