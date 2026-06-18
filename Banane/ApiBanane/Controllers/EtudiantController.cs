using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetRepository;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EtudiantController : ControllerBase
    {

        private readonly ETUDIANTservice _EtudiantService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public EtudiantController(ETUDIANTservice EtudiantService, IEmailService emailService, IConfiguration configuration)
        {
            _EtudiantService = EtudiantService;
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

        private string GenerateToken(ETUDIANT Etudiant)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings["Key"])
                );

            var claims = new[]
                {
        new Claim(ClaimTypes.NameIdentifier, Etudiant.IdUtilisateur.ToString()),
        new Claim(ClaimTypes.Role, "Etudiant"),
        new Claim(ClaimTypes.Email, Etudiant.Email ?? ""),
        new Claim(ClaimTypes.Name, Etudiant.Nom ?? ""),
        new Claim(ClaimTypes.GivenName, Etudiant.Prenom ?? "")
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

        [HttpPost("CreateEtudiant")]
        public async Task<ActionResult<ETUDIANT>> CreateEtudiant([FromBody] EtudiantDTO Etudiant)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                string clearPassword = GeneratePassword();

                ETUDIANT Etudiant1 = new ETUDIANT(Etudiant.Nom, Etudiant.Prenom,
                    Etudiant.Email, BCrypt.Net.BCrypt.HashPassword(clearPassword), Etudiant.Matricule);
                Etudiant1.Filiere = Etudiant.IdFiliere;
                if (Etudiant.IdNiveauScolaire.HasValue)
                    Etudiant1.IdNiveauScolaire_fk_Etudiant = Etudiant.IdNiveauScolaire.Value;
                var created = await _EtudiantService.CreateETUDIANTAsync(Etudiant1);
                await _emailService.SendCredentialsAsync(Etudiant.Email, clearPassword, "Etudiant");
                return CreatedAtAction(nameof(GetEtudiantById), new { id = created.IdUtilisateur }, created);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetEtudiantById/{id}")]
        public async Task<ActionResult<ETUDIANT>> GetEtudiantById(int id)
        {
            try
            {
                var Etudiant = await _EtudiantService.GetETUDIANTByIdAsync(id);
                return Etudiant == null ? NotFound() : Ok(Etudiant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllEtudiant")]
        public async Task<ActionResult<IEnumerable<ETUDIANT>>> GetAllEtudiant()
        {
            try
            {
                var Etudiants = await _EtudiantService.GetAllETUDIANTAsync();
                return Ok(Etudiants);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdateEtudiant/{id}")]
        public async Task<IActionResult> UpdateEtudiant(int id, [FromBody] ETUDIANT etudiant)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != etudiant.IdUtilisateur)
                return BadRequest("ID mismatch");

            try
            {
                await _EtudiantService.UpdateETUDIANTAsync(etudiant);
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

        [HttpDelete("DeleteEtudiant/{id}")]
        public async Task<ActionResult<ETUDIANT>> DeleteEtudiant(int id)
        {
            try
            {
                var deleted = await _EtudiantService.DeleteETUDIANTAsync(id);

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
        public async Task<ActionResult> LoginEtudiant([FromBody] LoginDTO login)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var Etudiant = await _EtudiantService.GetETUDIANTByEmailAsync(login.Email);

                if (Etudiant == null)
                    return Unauthorized("Invalid credentials");

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(login.Password, Etudiant.MotDePasse);

                if (!isPasswordValid)
                    return Unauthorized("Invalid credentials");

                string token = GenerateToken(Etudiant);
                return Ok(new
                {
                    user = new
                    {
                        id = Etudiant.IdUtilisateur,
                        email = Etudiant.Email,
                        name = Etudiant.Nom,
                        firstname = Etudiant.Prenom,
                        role = "Etudiant",
                        photoUrl = Etudiant.photoUrl
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
