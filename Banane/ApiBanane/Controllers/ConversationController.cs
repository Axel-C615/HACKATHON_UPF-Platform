using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;


namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ConversationController : Controller
    {
        private readonly CONVERSATIONservice _conversationService;

        public ConversationController(CONVERSATIONservice conversationService)
        {
            _conversationService = conversationService;
        }

        [HttpPost("CreateConversation")]
        public async Task<ActionResult<CONVERSATION>> CreateConversation([FromBody] ConversationDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var conversation = new CONVERSATION
                (dto.TypeConversation,
                        dto.Nom,
                        dto.IdCreateur);

                var created = await _conversationService.CreateCONVERSATIONAsync(conversation);
                return CreatedAtAction(nameof(GetConversationById), new { id = created.IdConversation }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetConversationById/{id}")]
        public async Task<ActionResult<CONVERSATION>> GetConversationById(int id)
        {
            try
            {
                var conversation = await _conversationService.GetCONVERSATIONByIdAsync(id);
                return conversation == null ? NotFound() : Ok(conversation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllConversation")]
        public async Task<ActionResult<IEnumerable<CONVERSATION>>> GetAllConversation()
        {
            try
            {
                var conversations = await _conversationService.GetAllCONVERSATIONAsync();
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        //[HttpGet("user/{idUtilisateur}")]
        //public async Task<ActionResult<IEnumerable<CONVERSATION>>> GetConversationsByUser(int idUtilisateur)
        //{
        //    try
        //    {
        //        var conversations = await _conversationService.GetConversationsByUserAsync(idUtilisateur);
        //        return Ok(conversations);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}

        [HttpDelete("DeleteConversation/{id}")]
        public async Task<ActionResult<CONVERSATION>> DeleteConversation(int id)
        {
            try
            {
                var deleted = await _conversationService.DeleteCONVERSATIONAsync(id);
                return deleted == null ? NotFound() : Ok(deleted);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}