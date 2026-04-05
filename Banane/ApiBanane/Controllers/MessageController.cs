
using System;
using ApiBanane.ObjetMDTO;
using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.AspNetCore.Mvc;


namespace ApiBanane.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class MessageController : Controller
    {
        private readonly MESSAGEservice _messageService;

        public MessageController(MESSAGEservice messageService)
        {
            _messageService = messageService;
        }

        [HttpPost("envoyer")]
        public async Task<ActionResult<MESSAGE>> EnvoyerMessage([FromBody] MessageDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Utilisation du constructeur de la classe MESSAGE
                var message = new MESSAGE(
                    dto.Contenu,
                    dto.IdExpediteur_fk,
                    dto.IdConversation_fk_Message
                );

                var created = await _messageService.CreateMESSAGEAsync(message);

                return CreatedAtAction(
                    nameof(GetMessageById),
                    new { id = created.IdMessage },
                    created
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetMessageById/{id}")]
        public async Task<ActionResult<MESSAGE>> GetMessageById(int id)
        {
            try
            {
                var message = await _messageService.GetMESSAGEByIdAsync(id);
                return message == null ? NotFound() : Ok(message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllMessage")]
        public async Task<ActionResult<IEnumerable<MESSAGE>>> GetAllMessage()
        {
            try
            {
                var messages = await _messageService.GetAllMESSAGEAsync();
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("conversation/{idConversation}")]
        public async Task<ActionResult<IEnumerable<MESSAGE>>> GetMessagesByConversation(int idConversation)
        {
            try
            {
                var messages = await _messageService.GetMessagesByConversationIdAsync(idConversation);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}