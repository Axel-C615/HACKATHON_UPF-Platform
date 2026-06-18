using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetRepository;
using Banane.ObjetService;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;



namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdministrateurController :ControllerBase
    {
        private readonly ADMINISTRATEURservice _AdministrateurService;
        private readonly IConfiguration _configuration;
       
        private readonly IEmailService _emailService;
        public AdministrateurController(ADMINISTRATEURservice AdministrateurService, IEmailService emailService, IConfiguration configuration)
        {
            _AdministrateurService = AdministrateurService;
            _configuration = configuration;
            _emailService = emailService;
        }
        private static string GeneratePassword(int length = 8)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
            var bytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
        }
        private string GenerateToken(ADMINISTRATEUR Administrateur)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings["Key"])
                );

            var claims = new[]
                {
                        new Claim(ClaimTypes.NameIdentifier, Administrateur.IdUtilisateur.ToString()),
                        new Claim(ClaimTypes.Role, "Administrateur"),
                        new Claim(ClaimTypes.Email, Administrateur.Email ?? ""),
                        new Claim(ClaimTypes.Name, Administrateur.Nom ?? ""),
                        new Claim(ClaimTypes.GivenName, Administrateur.Prenom ?? "")
                    };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    Convert.ToDouble(jwtSettings["ExpireHours"])
                ),
                signingCredentials: new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                )
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("CreateAdministrateur")]
        public async Task<ActionResult<ADMINISTRATEUR>> CreateAdministrateur([FromBody] AdministrateurDTO Administrateur)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                string clearPassword = GeneratePassword();

                ADMINISTRATEUR Adminitrateur1 = new ADMINISTRATEUR(Administrateur.Nom, Administrateur.Prenom,
                    Administrateur.Email, BCrypt.Net.BCrypt.HashPassword(clearPassword));
                var created = await _AdministrateurService.CreateADMINISTRATEURAsync(Adminitrateur1);
                await _emailService.SendCredentialsAsync(Administrateur.Email, clearPassword, "Administrateur");
                return CreatedAtAction(nameof(GetUtilisateurById), new { id = created.IdUtilisateur }, created);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAdministrateurById/{id}")]
        public async Task<ActionResult<ADMINISTRATEUR>> GetUtilisateurById(int id)
        {
            try
            {
                var Utilisateur = await _AdministrateurService.GetADMINISTRATEURByIdAsync(id);
                return Utilisateur == null ? NotFound() : Ok(Utilisateur);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllAdministrateur")]
        public async Task<ActionResult<IEnumerable<ADMINISTRATEUR>>> GetAllAdministrateur()
        {
            try
            {
                var Utilisateurs = await _AdministrateurService.GetAllADMINISTRATEURAsync();
                return Ok(Utilisateurs);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdateAdministrateur/{id}")]
        public async Task<IActionResult> UpdateUtilisateur(int id, [FromBody] ADMINISTRATEUR adminstrateur)
        {
            // Nouveau : Double validation du modèle et de la cohérence des IDs
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != adminstrateur.IdUtilisateur)
                return BadRequest("ID mismatch");

            try
            {
                await _AdministrateurService.UpdateADMINISTRATEURAsync(adminstrateur);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteUtisateur/{id}")]
        public async Task<ActionResult<ADMINISTRATEUR>> DeleteUtilisateur(int id)
        {
            try
            {
                var deleted = await _AdministrateurService.DeleteADMINISTRATEURAsync(id);

                // Nouveau : Gestion du cas où l'entité n'existe pas
                if (deleted is null)
                {
                    return NotFound();
                }
                return Ok(deleted);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost("login")]
        public async Task<ActionResult> LoginUtilisateur([FromBody] LoginDTO login)
        {
            
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // 1. Récupérer l'utilisateur par email UNIQUEMENT
                var Administrateur = await _AdministrateurService.GetADMINISTRATEURByEmailAsync(login.Email);

                if (Administrateur == null)
                    return Unauthorized("Invalid credentials");

                // 2. Vérifier le mot de passe avec BCrypt.Verify()
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(login.Password, Administrateur.MotDePasse);

                if (!isPasswordValid)
                    return Unauthorized("Invalid credentials");

                // 3. Générer le token
                string token = GenerateToken(Administrateur);
                return Ok(new
                {
                    user = new
                    {
                        id = Administrateur.IdUtilisateur,
                        email = Administrateur.Email,
                        name = Administrateur.Nom,
                        firstname = Administrateur.Prenom,
                        role = "Administrateur",
                        photoUrl = Administrateur.photoUrl
                    },
                    token
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
