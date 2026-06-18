using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class MESSAGEservice
    {
        private readonly IRepositoryService<MESSAGE> _Message;

        public MESSAGEservice(IRepositoryService<MESSAGE> Messages)
        {
            _Message = Messages;
        }

        

        public async Task<MESSAGE> CreateMESSAGEAsync(MESSAGE newMessage)
        {

            // Définit automatiquement la date d'envoi si non spécifiée
            if (newMessage.DateEnvoi == default)
            {
                newMessage.DateEnvoi = DateTime.Now;
            }

            // Ajoute le message au contexte EF
            await _Message.AddAsync(newMessage);
            // Persiste les changements en base
            await _Message.SaveChangesAsync();

            return newMessage;
        }

        public async Task<MESSAGE?> GetMESSAGEByIdAsync(int id)
        {
            return await _Message.GetByIdAsync(id);
        }

        public async Task<IEnumerable<MESSAGE>> GetAllMESSAGEAsync()
        {
            return await _Message.ListAsync();
        }

        public async Task UpdateMESSAGEAsync(MESSAGE Message)
        {
            // Indique à EF que l'entité a été modifiée
            _Message.Update(Message);
            // Persiste les modifications
            await _Message.SaveChangesAsync();
        }

        public async Task<MESSAGE?> DeleteMESSAGEAsync(int id)
        {
            var existing = await _Message.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Message avec ID {id} introuvable.");

            // Marque pour suppression
            _Message.Delete(existing);
            // Applique la suppression en base
            await _Message.SaveChangesAsync();

            return existing;
        }

        // Méthode utilitaire pour récupérer les messages d'une conversation spécifique
        public async Task<IEnumerable<MESSAGE>> GetMessagesByConversationIdAsync(int conversationId)
        {
            return await _Message.GetByConditionAsync(m => m.IdConversation_fk_Message == conversationId);
        }

        // Méthode utilitaire pour récupérer les messages envoyés par un utilisateur
        public async Task<IEnumerable<MESSAGE>> GetMessagesByExpediteurIdAsync(int expediteurId, int IdConversation)
        {
            return await _Message.GetByConditionAsync
                (m => m.IdExpediteur_fk == expediteurId && m.IdConversation_fk_Message== IdConversation);
        }
    }
}
