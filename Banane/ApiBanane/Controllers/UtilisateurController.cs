using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ApiBanane.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    

        public class UtilisateurController : ControllerBase
        {
            private readonly UTILISATEURservice _UtilisateurService;
            private readonly IConfiguration _configuration;

            public UtilisateurController(UTILISATEURservice UtilisateurService, IConfiguration configuration)
            {
                _UtilisateurService = UtilisateurService;
                _configuration = configuration;
            }


            [HttpGet("GetUtilisateurById/{id}")]
            public async Task<ActionResult<UTILISATEUR>> GetUtilisateurById(int id)
            {
                try
                {
                    var Utilisateur = await _UtilisateurService.GetUTILISATEURByIdAsync(id);
                    return Utilisateur == null ? NotFound() : Ok(Utilisateur);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }

            [HttpGet("GetAllUtilisateur")]
            public async Task<ActionResult<IEnumerable<UTILISATEUR>>> GetAllUtilisateur()
            {
                try
                {
                    var Utilisateurs = await _UtilisateurService.GetAllUTILISATEURAsync();
                    return Ok(Utilisateurs);

                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }

            
        
    }
}
