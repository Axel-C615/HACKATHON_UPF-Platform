
using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;



namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatiereController : Controller
    {
        private readonly MATIEREservice _matiereService;

        public MatiereController(MATIEREservice matiereService)
        {
            _matiereService = matiereService;
        }

        [HttpPost("CreateMatiere")]
        public async Task<ActionResult<MATIERE>> CreateMatiere([FromBody] MatiereDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var matiere = new MATIERE(
                    dto.Titre,
                    dto.Code,
                    dto.IdEnseignant_fk,
                    dto.IdNiveauScolaire_fk_Matiere
                );

                var created = await _matiereService.CreateMATIEREAsync(matiere);
                return CreatedAtAction(nameof(GetMatiereById), new { id = created.IdMatiere }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetMatiereById/{id}")]
        public async Task<ActionResult<MATIERE>> GetMatiereById(int id)
        {
            try
            {
                var matiere = await _matiereService.GetMATIEREByIdAsync(id);
                return matiere == null ? NotFound() : Ok(matiere);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllMatiere")]
        public async Task<ActionResult<IEnumerable<MATIERE>>> GetAllMatiere()
        {
            try
            {
                var matieres = await _matiereService.GetAllMATIEREAsync();
                return Ok(matieres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        //[HttpGet("niveau/{idNiveau}")]
        //public async Task<ActionResult<IEnumerable<MATIERE>>> GetMatieresByNiveau(int idNiveau)
        //{
        //    try
        //    {
        //        var matieres = await _matiereService.GetMatieresByNiveauAsync(idNiveau);
        //        return Ok(matieres);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}

        [HttpPut("UpdateMatiere/{id}")]
        public async Task<IActionResult> UpdateMatiere(int id, [FromBody] MATIERE matiere)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != matiere.IdMatiere) return BadRequest("ID mismatch");

            try
            {
                await _matiereService.UpdateMATIEREAsync(matiere);
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

        [HttpDelete("DeleteMatiere/{id}")]
        public async Task<ActionResult<MATIERE>> DeleteMatiere(int id)
        {
            try
            {
                var deleted = await _matiereService.DeleteMATIEREAsync(id);
                return deleted == null ? NotFound() : Ok(deleted);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}