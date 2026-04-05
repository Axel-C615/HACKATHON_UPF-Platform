using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;
using Banane.ObjetRepository;

namespace Banane.ObjetService
{
    public class ADMINISTRATEURservice
    {
        private readonly IRepositoryService<ADMINISTRATEUR> _Administrateur;
        private readonly IRepositoryService<UTILISATEUR> _Utilisateur;
       

        public ADMINISTRATEURservice(IRepositoryService<ADMINISTRATEUR> Administrateurs, IRepositoryService<UTILISATEUR> utilisateur)
        {
            _Administrateur = Administrateurs;
            _Utilisateur = utilisateur;
        }

        // Vérification s'il existe un ADMINISTRATEUR avec les mêmes attributs
        public async Task<bool> ADMINISTRATEURexistsAsync(ADMINISTRATEUR Administrateur)
        {
            var existingAdministrateur = await _Utilisateur.GetByConditionAsync(a =>
                a.Email == Administrateur.Email);

            return existingAdministrateur.Any(); // RETOURNE UN BOOL T ou F
        }

        public async Task<ADMINISTRATEUR> CreateADMINISTRATEURAsync(ADMINISTRATEUR newAdministrateur)
        {
            if (await ADMINISTRATEURexistsAsync(newAdministrateur))
            {
                throw new Exception($"Cet Email de : {newAdministrateur.Email} existe déjà.");
            }

            // Ajoute l'administrateur au contexte EF
            await _Administrateur.AddAsync(newAdministrateur);
            // Persiste les changements en base
            await _Administrateur.SaveChangesAsync();
           

            return newAdministrateur;
        }

        public async Task<ADMINISTRATEUR?> GetADMINISTRATEURByIdAsync(int id)
        {
            return await _Administrateur.GetByIdAsync(id);
        }

        public async Task<IEnumerable<ADMINISTRATEUR>> GetAllADMINISTRATEURAsync()
        {
            return await _Administrateur.ListAsync();
        }

        public async Task UpdateADMINISTRATEURAsync(ADMINISTRATEUR Administrateur)
        {
            // Indique à EF que l'entité a été modifiée
            _Administrateur.Update(Administrateur);
            // Persiste les modifications
            await _Administrateur.SaveChangesAsync();
        }

        public async Task<ADMINISTRATEUR?> DeleteADMINISTRATEURAsync(int id)
        {
            var existing = await _Administrateur.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Administrateur avec ID {id} introuvable.");

            // Marque pour suppression
            _Administrateur.Delete(existing);
            // Applique la suppression en base
            await _Administrateur.SaveChangesAsync();

            return existing;
        }

        
        public async Task<ADMINISTRATEUR?> GetADMINISTRATEURByEmailAsync(string email)
        {
            return (ADMINISTRATEUR?)await _Administrateur.FindByEmailAsync(email);
            
        }
       
    }
}
