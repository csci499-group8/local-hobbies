#1. build
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

#2. run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
#copy only .jar to final image
COPY --from=build /app/target/*.jar app.jar

#3. configure container
#document default port
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT:8080}"]
