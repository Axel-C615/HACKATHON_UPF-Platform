# ── Build stage ──────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Banane/Banane.csproj Banane/
COPY ApiBanane/ApiBanane.csproj ApiBanane/
RUN dotnet restore ApiBanane/ApiBanane.csproj

COPY . .
WORKDIR /src/ApiBanane
RUN dotnet publish -c Release -o /app/publish

# ── Runtime stage ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:${PORT}
ENTRYPOINT ["dotnet", "ApiBanane.dll"]