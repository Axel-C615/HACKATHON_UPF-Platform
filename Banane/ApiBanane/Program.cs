using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using Banane.DataObject;
using Banane.ObjetMetier;
using Banane.ObjetRepository;
using Banane.ObjetService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        // GetAllFiliere inclut NiveauxScolaires → chaque niveau pointe vers Filière : boucle JSON sans ceci.
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddScoped<BananeDb>();

// Add services to the container.

builder.Services.AddScoped<IRepositoryService<ADMINISTRATEUR>, RepositoryService<ADMINISTRATEUR>>();
builder.Services.AddScoped<IRepositoryService<CONVERSATION>, RepositoryService<CONVERSATION>>();
builder.Services.AddScoped<IRepositoryService<DOCUMENT>, RepositoryService<DOCUMENT>>();
builder.Services.AddScoped<IRepositoryService<ENSEIGNANT>, RepositoryService<ENSEIGNANT>>();
builder.Services.AddScoped<IRepositoryService<ETUDIANT>, RepositoryService<ETUDIANT>>();
builder.Services.AddScoped<IRepositoryService<FILIERE>, RepositoryService<FILIERE>>();
builder.Services.AddScoped<IRepositoryService<MATIERE>, RepositoryService<MATIERE>>();
builder.Services.AddScoped<IRepositoryService<MEMBRECONVERSATION>, RepositoryService<MEMBRECONVERSATION>>();
builder.Services.AddScoped<IRepositoryService<MESSAGE>, RepositoryService<MESSAGE>>();
builder.Services.AddScoped<IRepositoryService<NIVEAUSCOLAIRE>, RepositoryService<NIVEAUSCOLAIRE>>();
builder.Services.AddScoped<IRepositoryService<UTILISATEUR>, RepositoryService<UTILISATEUR>>();
builder.Services.AddScoped<IRepositoryService<ABSENCE>, RepositoryService<ABSENCE>>();

builder.Services.AddScoped<IEmailService, EmailService>();

// Enregistrement des services
builder.Services.AddScoped<ADMINISTRATEURservice>();
builder.Services.AddScoped<CONVERSATIONservice>();
builder.Services.AddScoped<DOCUMENTservice>();
builder.Services.AddScoped<ENSEIGNANTservice>();
builder.Services.AddScoped<ETUDIANTservice>();
builder.Services.AddScoped<FILIEREservice>();
builder.Services.AddScoped<MATIEREservice>();

builder.Services.AddScoped<MEMBRECONVERSATIONservice>();
builder.Services.AddScoped<MESSAGEservice>();
builder.Services.AddScoped<NIVEAUSCOLAIREservice>();
builder.Services.AddScoped<UTILISATEURservice>();
builder.Services.AddScoped<ABSENCEservice>();




// 1. Ajouter CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("React", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // port Vite par défaut
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Configuration Jwt:Key manquante (voir appsettings).");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});
builder.Services.AddAuthorization();


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();






var app = builder.Build();


app.UseCors("React");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseStaticFiles();

// En dev, Kestrel est souvent HTTP seul : la redirection HTTPS casse le proxy Vite et certains clients.
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
