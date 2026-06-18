

using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;
using Banane.ObjetMetier;


namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : Controller
    {
        private readonly DOCUMENTservice _documentService;

        public DocumentController(DOCUMENTservice documentService)
        {
            _documentService = documentService;
        }

        //[HttpPost("upload")]
        //public async Task<ActionResult<DOCUMENT>> UploadDocument([FromBody] DocumentDTO dto)
        //{
        //    if (!ModelState.IsValid) return BadRequest(ModelState);

        //    try
        //    {
        //        // Utilisation du constructeur de la classe DOCUMENT
        //        var document = new DOCUMENT(
        //            dto.IdMatiere_fk_Document,
        //            dto.UrlDocument,
        //            dto.TypeDocument
        //        );

        //        var created = await _documentService.UploadDocumentAsync(document);
        //        return CreatedAtAction(nameof(GetDocumentById), new { id = created.IdDocument }, created);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ex.Message);
        //    }
        //}

        [HttpGet("GetDocumentById/{id}")]
        public async Task<ActionResult<DOCUMENT>> GetDocumentById(int id)
        {
            try
            {
                var document = await _documentService.GetDOCUMENTByIdAsync(id);
                return document == null ? NotFound() : Ok(document);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllDocument")]
        public async Task<ActionResult<IEnumerable<DOCUMENT>>> GetAllDocument()
        {
            try
            {
                var documents = await _documentService.GetAllDOCUMENTAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        //[HttpGet("matiere/{idMatiere}")]
        //public async Task<ActionResult<IEnumerable<DOCUMENT>>> GetDocumentsByMatiere(int idMatiere)
        //{
        //    try
        //    {
        //        var documents = await _documentService.GetDocumentsByMatiereAsync(idMatiere);
        //        return Ok(documents);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}
    }
}
