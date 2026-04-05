using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
   

        public class CONVERSATIONservice
        {
            private readonly IRepositoryService<CONVERSATION> _Conversation;

            public CONVERSATIONservice(IRepositoryService<CONVERSATION> Conversations)
            {
                _Conversation = Conversations;
            }

            

            public async Task<CONVERSATION> CreateCONVERSATIONAsync(CONVERSATION newConversation)
            {
               

                // Ajoute la conversation au contexte EF
                await _Conversation.AddAsync(newConversation);
                // Persiste les changements en base
                await _Conversation.SaveChangesAsync();

                return newConversation;
            }

            public async Task<CONVERSATION?> GetCONVERSATIONByIdAsync(int id)
            {
                return await _Conversation.GetByIdAsync(id);
            }

            public async Task<IEnumerable<CONVERSATION>> GetAllCONVERSATIONAsync()
            {
                return await _Conversation.ListAsync();
            }

            public async Task UpdateCONVERSATIONAsync(CONVERSATION Conversation)
            {
                // Indique à EF que l'entité a été modifiée
                _Conversation.Update(Conversation);
                // Persiste les modifications
                await _Conversation.SaveChangesAsync();
            }

            public async Task<CONVERSATION?> DeleteCONVERSATIONAsync(int id)
            {
                var existing = await _Conversation.GetByIdAsync(id);
                if (existing == null)
                    throw new KeyNotFoundException($"Conversation avec ID {id} introuvable.");

                // Marque pour suppression
                _Conversation.Delete(existing);
                // Applique la suppression en base
                await _Conversation.SaveChangesAsync();

                return existing;
            }
        
    }
}
