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
    public class EnseignantController : ControllerBase
    {
        private readonly ENSEIGNANTservice _EnseignantService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public EnseignantController(ENSEIGNANTservice EnseignantService, IEmailService emailService, IConfiguration configuration)
        {
            _EnseignantService = EnseignantService;  // Corrigé : était AdministrateurService
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

        private string GenerateToken(ENSEIGNANT Enseignant)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings["Key"])
                );

            var claims = new[]
                {
                new Claim(ClaimTypes.NameIdentifier, Enseignant.IdUtilisateur.ToString()),
                new Claim(ClaimTypes.Role, "Enseignant"),  // Changé de "Administrateur"
                new Claim(ClaimTypes.Email, Enseignant.Email ?? ""),
                new Claim(ClaimTypes.Name, Enseignant.Nom ?? ""),
                new Claim(ClaimTypes.GivenName, Enseignant.Prenom ?? "")
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

        [HttpPost("CreateEnseignant")]
        public async Task<ActionResult<ENSEIGNANT>> CreateEnseignant([FromBody] EnseignantDTO Enseignant)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                string clearPassword = GeneratePassword();

                ENSEIGNANT Enseignant1 = new ENSEIGNANT(Enseignant.Nom, Enseignant.Prenom,
                    Enseignant.Email, BCrypt.Net.BCrypt.HashPassword(clearPassword), Enseignant.Matricule);
                var created = await _EnseignantService.CreateENSEIGNANTAsync(Enseignant1);
                await _emailService.SendCredentialsAsync(Enseignant.Email, clearPassword, "Enseignant");
                return CreatedAtAction(nameof(GetEnseignantById), new { id = created.IdUtilisateur }, created);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetEnseignantById/{id}")]
        public async Task<ActionResult<ENSEIGNANT>> GetEnseignantById(int id)
        {
            try
            {
                var Enseignant = await _EnseignantService.GetENSEIGNANTByIdAsync(id);
                return Enseignant == null ? NotFound() : Ok(Enseignant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllEnseignant")]
        public async Task<ActionResult<IEnumerable<ENSEIGNANT>>> GetAllEnseignant()
        {
            try
            {
                var Enseignants = await _EnseignantService.GetAllENSEIGNANTAsync();
                return Ok(Enseignants);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdateEnseignant/{id}")]
        public async Task<IActionResult> UpdateEnseignant(int id, [FromBody] ENSEIGNANT enseignant)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != enseignant.IdUtilisateur)
                return BadRequest("ID mismatch");

            try
            {
                await _EnseignantService.UpdateENSEIGNANTAsync(enseignant);
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

        [HttpDelete("DeleteEnseignant/{id}")]
        public async Task<ActionResult<ENSEIGNANT>> DeleteEnseignant(int id)
        {
            try
            {
                var deleted = await _EnseignantService.DeleteENSEIGNANTAsync(id);

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
        public async Task<ActionResult> LoginEnseignant([FromBody] LoginDTO login)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var Enseignant = await _EnseignantService.GetENSEIGNANTByEmailAsync(login.Email);

                if (Enseignant == null)
                    return Unauthorized("Invalid credentials");

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(login.Password, Enseignant.MotDePasse);

                if (!isPasswordValid)
                    return Unauthorized("Invalid credentials");

                string token = GenerateToken(Enseignant);
                return Ok(new
                {
                    user = new
                    {
                        id = Enseignant.IdUtilisateur,
                        email = Enseignant.Email,
                        name = Enseignant.Nom,
                        firstname = Enseignant.Prenom,
                        role = "Enseignant",  // Changé de "Administrateur"
                        photoUrl = Enseignant.photoUrl
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

