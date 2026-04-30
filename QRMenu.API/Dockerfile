# ── Build aşaması ──────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY QRMenu.API.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# ── Runtime aşaması ────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# wwwroot klasörlerini oluştur
RUN mkdir -p wwwroot/uploads wwwroot/qrcodes

COPY --from=build /app/publish .

# Railway PORT env variable'ını kullan
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "QRMenu.API.dll"]
