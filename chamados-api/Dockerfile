# Usando a imagem oficial e leve do Java 25 da Temurin ☕🔥
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

# Copia o arquivo executável .jar que o seu Windows já gerou na pasta target
COPY target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]