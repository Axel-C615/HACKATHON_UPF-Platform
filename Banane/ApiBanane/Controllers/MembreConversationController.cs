

using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;

namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembreConversationController : Controller
    {
        private readonly MEMBRECONVERSATIONservice _membreService;

        public MembreConversationController(MEMBRECONVERSATIONservice membreService)
        {
            _membreService = membreService;
        }

        [HttpPost("ajouter")]
        //public async Task<ActionResult<MEMBRECONVERSATION>> AjouterMembre([FromBody] MembreConverationDTO dto)
        //{
        //    if (!ModelState.IsValid)
        //        return BadRequest(ModelState);

        //    try
        //    {
        //        var membre = new MEMBRECONVERSATION(
        //            dto.IdMembre_fk_MembreC,
        //            dto.Role ?? "membre",
        //            dto.Createur
        //        );

        //        var created = await _membreService.AjouterMembreAsync(membre, dto.IdConversation_fk_MembreC);
        //        return Ok(created);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}

        [HttpGet("conversation/{idConversation}")]
        public async Task<ActionResult<IEnumerable<MEMBRECONVERSATION>>> GetMembresByConversation(int idConversation)
        {
            try
            {
                var membres = await _membreService.GetMEMBRECONVERSATIONByIdAsync(idConversation);
                return Ok(membres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}