

using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;


namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FiliereController : Controller
{
    private readonly FILIEREservice _filiereService;

    public FiliereController(FILIEREservice filiereService)
    {
        _filiereService = filiereService;
    }

    [HttpPost("CreateFiliere")]
    public async Task<ActionResult<FILIERE>> CreateFiliere([FromBody] FiliereDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var filiere = new FILIERE(dto.Code, dto.Nom);
            var created = await _filiereService.CreateFILIEREAsync(filiere);
            return CreatedAtAction(nameof(GetFiliereById), new { id = created.IdFiliere }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }


    [HttpGet("GetFiliereById/{id}")]
    public async Task<ActionResult<FILIERE>> GetFiliereById(int id)
    {
        try
        {
            var filiere = await _filiereService.GetFILIEREByIdAsync(id);
            return filiere == null ? NotFound() : Ok(filiere);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("GetAllFiliere")]
    public async Task<ActionResult<IEnumerable<FILIERE>>> GetAllFiliere()
    {
        try
        {
            var filieres = await _filiereService.GetAllFILIEREAsync();
            return Ok(filieres);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
        [HttpPut("UpdateFiliere/{id}")]
        public async Task<IActionResult> UpdateFiiere(int id, [FromBody] FILIERE Filiere)
        {
            // Nouveau : Double validation du modèle et de la cohérence des IDs
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != Filiere.IdFiliere)
                return BadRequest("ID mismatch");

            try
            {
                await _filiereService.UpdateFILIEREAsync(Filiere);
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
        [HttpPost("{idFiliere}/niveaux")]
        public async Task<IActionResult> AddNiveaux(int idFiliere, [FromBody] List<int> niveauxIds)
        {
            var result = await _filiereService.AddNiveauxScolairesToFiliereAsync(idFiliere, niveauxIds);
            return Ok(result);
        }
        [HttpDelete("{idFiliere}/niveaux/{niveauId}")]
        public async Task<IActionResult> RemoveNiveau(int idFiliere, int niveauId)
        {
            var result = await _filiereService.RemoveNiveauFromFiliereAsync(idFiliere, niveauId);
            return Ok(result);
        }

        [HttpDelete("{idFiliere}/niveaux")]
        public async Task<IActionResult> RemoveNiveaux(int idFiliere, [FromBody] List<int> niveauxIds)
        {
            var result = await _filiereService.RemoveNiveauxFromFilieresAsync(idFiliere, niveauxIds);
            return Ok(result);
        }

        [HttpPatch("Filiere/{id}")]
        public async Task<IActionResult> PatchArticle(int id,
                                             [FromBody] Dictionary<string, object> changes)
        {
            if (changes == null || changes.Count == 0)
                return BadRequest("No fields to update.");

            var updated = await _filiereService.PatchFiliereAsync(id, changes);
            if (updated == null) return NotFound();

            return NoContent();
        }


        [HttpDelete("DeleteUtisateur/{id}")]
        public async Task<ActionResult<FILIERE>> DeleteFiliere(int id)
        {
            try
            {
                var deleted = await _filiereService.DeleteFILIEREAsync(id);

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
    }
}