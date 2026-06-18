using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class UTILISATEURservice
    {
        private readonly IRepositoryService<UTILISATEUR> _Utilisateur;
        public UTILISATEURservice(IRepositoryService<UTILISATEUR> Utilisateurs)
        {
            _Utilisateur = Utilisateurs;

        }

        //Verification s'il existe un UTILISATEUR avec les mêmes attributs
        public async Task<bool> UTILISATEURexistsAsync(UTILISATEUR Utilisateur)
        {
            
            var existingUtilisateur = await _Utilisateur.GetByConditionAsync(c =>
                c.Email == Utilisateur.Email );

            return existingUtilisateur.Any(); //RETOURN UN BOOL T ou F
        }
        public async Task<UTILISATEUR> CreateUTILISATEURAsync(UTILISATEUR newUtilisateur)
        {
            if (await UTILISATEURexistsAsync(newUtilisateur))
            {
                throw new Exception($" Cet Email de :{newUtilisateur.Email}    existe déjà.");

            }
            // Ajoute le patient au contexte EF
            await _Utilisateur.AddAsync(newUtilisateur);
            // Persiste les changements en base
            await _Utilisateur.SaveChangesAsync();

            return newUtilisateur;
        }
        public async Task<UTILISATEUR?> GetUTILISATEURByIdAsync(int id)
        {
            return await _Utilisateur.GetByIdAsync(id);
        }


        public async Task<IEnumerable<UTILISATEUR>> GetAllUTILISATEURAsync()
        {
            return await _Utilisateur.ListAsync();
        }
        
        
        
        public async Task UpdateUTILISATEURAsync(UTILISATEUR Utilisateur)
        {
            // Indique à EF que l'entité a été modifiée
            _Utilisateur.Update(Utilisateur);
            // Persiste les modifications
            await _Utilisateur.SaveChangesAsync();
        }


        public async Task<UTILISATEUR?> DeleteArticleAsync(int id)
        {
            
            var existing = await _Utilisateur.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Uilisateur avec ID {id} introuvable.");

            // Marque pour suppression
            _Utilisateur.Delete(existing);
            // Applique la suppression en base
            await _Utilisateur.SaveChangesAsync();
            return existing;
        }
        public async Task<UTILISATEUR?> GetUTILISATEURByEmailAsync(string email)
        {
            return (UTILISATEUR?)await _Utilisateur.FindByEmailAsync(email);

        }















    }
}
