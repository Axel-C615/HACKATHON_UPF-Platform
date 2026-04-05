

using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;


namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class NiveauScolaireController : Controller
    {
        private readonly NIVEAUSCOLAIREservice _niveauService;

        public NiveauScolaireController(NIVEAUSCOLAIREservice niveauService)
        {
            _niveauService = niveauService;
        }

        [HttpPost("CreateNiveau")]
        public async Task<ActionResult<NIVEAUSCOLAIRE>> CreateNiveau([FromBody] NiveauScolaireDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Utilisation du constructeur de ta classe NIVEAUSCOLAIRE
                var niveau = new NIVEAUSCOLAIRE(
                    dto.Nom,
                    dto.IdFiliere_fk_NiveauScol
                );

                var created = await _niveauService.CreateNIVEAUSCOLAIREAsync(niveau);

                return CreatedAtAction(
                    nameof(GetNiveauById),
                    new { id = created.IdNiveauScolaire },
                    created
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetNiveauById/{id}")]
        public async Task<ActionResult<NIVEAUSCOLAIRE>> GetNiveauById(int id)
        {
            try
            {
                var niveau = await _niveauService.GetNIVEAUSCOLAIREByIdAsync(id);
                return niveau == null ? NotFound() : Ok(niveau);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllNiveau")]
        public async Task<ActionResult<IEnumerable<NIVEAUSCOLAIRE>>> GetAllNiveau()
        {
            try
            {
                var niveaux = await _niveauService.GetAllNIVEAUSCOLAIREAsync();
                return Ok(niveaux);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost("{niveauId}/etudiants")]
        public async Task<IActionResult> AddEtudiants(int niveauId, [FromBody] ListID_DTO dto)
        {
            var result = await _niveauService.AddEtudiantsToNiveauAsync(niveauId, dto.ListIds);
            return Ok(result);
        }
        [HttpDelete("{niveauId}/etudiants")]
        public async Task<IActionResult> RemoveEtudiants(int niveauId, [FromBody] ListID_DTO dto)
        {
            var result = await _niveauService.RemoveEtudiantsFromNiveauAsync(niveauId, dto.ListIds);
            return Ok(result);
        }

    }
}