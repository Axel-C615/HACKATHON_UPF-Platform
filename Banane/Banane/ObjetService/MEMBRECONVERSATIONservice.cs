using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class MEMBRECONVERSATIONservice
    {
        private readonly IRepositoryService<MEMBRECONVERSATION> _MembreConversation;

        public MEMBRECONVERSATIONservice(IRepositoryService<MEMBRECONVERSATION> MembreConversations)
        {
            _MembreConversation = MembreConversations;
        }

        

        public async Task<MEMBRECONVERSATION> CreateMEMBRECONVERSATIONAsync(MEMBRECONVERSATION newMembreConversation)
        {
            

            // Ajoute le membre au contexte EF
            await _MembreConversation.AddAsync(newMembreConversation);
            // Persiste les changements en base
            await _MembreConversation.SaveChangesAsync();

            return newMembreConversation;
        }

        public async Task<MEMBRECONVERSATION?> GetMEMBRECONVERSATIONByIdAsync(int id)
        {
            return await _MembreConversation.GetByIdAsync(id);
        }

        public async Task<IEnumerable<MEMBRECONVERSATION>> GetAllMEMBRECONVERSATIONAsync()
        {
            return await _MembreConversation.ListAsync();
        }

        public async Task UpdateMEMBRECONVERSATIONAsync(MEMBRECONVERSATION MembreConversation)
        {
            // Indique à EF que l'entité a été modifiée
            _MembreConversation.Update(MembreConversation);
            // Persiste les modifications
            await _MembreConversation.SaveChangesAsync();
        }

        public async Task<MEMBRECONVERSATION?> DeleteMEMBRECONVERSATIONAsync(int id)
        {
            var existing = await _MembreConversation.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Membre de conversation avec ID {id} introuvable.");

            // Marque pour suppression
            _MembreConversation.Delete(existing);
            // Applique la suppression en base
            await _MembreConversation.SaveChangesAsync();

            return existing;
        }

        // Méthode utilitaire supplémentaire pour récupérer les membres d'une conversation spécifique
        public async Task<IEnumerable<MEMBRECONVERSATION>> GetMembresByConversationIdAsync(int conversationId)
        {
            return await _MembreConversation.GetByConditionAsync(m => m.IdConversation_fk_MembreC == conversationId);
        }

        // Méthode utilitaire pour récupérer les conversations d'un utilisateur spécifique
        public async Task<IEnumerable<MEMBRECONVERSATION>> GetConversationsByUtilisateurIdAsync(int utilisateurId)
        {
            return await _MembreConversation.GetByConditionAsync(m => m.IdMembre_fk_MembreC == utilisateurId);
        }
    }
}
