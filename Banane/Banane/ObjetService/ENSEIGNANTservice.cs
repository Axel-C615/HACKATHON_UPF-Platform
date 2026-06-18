using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    

        public class ENSEIGNANTservice
        {
            private readonly IRepositoryService<ENSEIGNANT> _Enseignant;
            private readonly IRepositoryService<UTILISATEUR> _Utilisateur;

        public ENSEIGNANTservice(IRepositoryService<ENSEIGNANT> Enseignants, IRepositoryService<UTILISATEUR> utilisateur)
        {
            _Enseignant = Enseignants;
            _Utilisateur = utilisateur;
        }

        // Vérification s'il existe un ENSEIGNANT avec les mêmes attributs
        public async Task<bool> ENSEIGNANTexistsAsync(ENSEIGNANT Enseignant)
            {
                var existingEnseignant = await _Utilisateur.GetByConditionAsync(c =>
                    c.Email == Enseignant.Email);

                return existingEnseignant.Any(); // RETOURNE UN BOOL T ou F
            }

            public async Task<ENSEIGNANT> CreateENSEIGNANTAsync(ENSEIGNANT newEnseignant)
            {
                if (await ENSEIGNANTexistsAsync(newEnseignant))
                {
                    throw new Exception($"Cet Email de : {newEnseignant.Email} existe déjà.");
                }

                // Ajoute l'enseignant au contexte EF
                await _Enseignant.AddAsync(newEnseignant);
                // Persiste les changements en base
                await _Enseignant.SaveChangesAsync();

                return newEnseignant;
            }

            public async Task<ENSEIGNANT?> GetENSEIGNANTByIdAsync(int id)
            {
                return await _Enseignant.GetByIdAsync(id);
            }

            public async Task<IEnumerable<ENSEIGNANT>> GetAllENSEIGNANTAsync()
            {
                return await _Enseignant.ListAsync();
            }

            public async Task UpdateENSEIGNANTAsync(ENSEIGNANT Enseignant)
            {
                // Indique à EF que l'entité a été modifiée
                _Enseignant.Update(Enseignant);
                // Persiste les modifications
                await _Enseignant.SaveChangesAsync();
            }

            public async Task<ENSEIGNANT?> DeleteENSEIGNANTAsync(int id)
            {
                var existing = await _Enseignant.GetByIdAsync(id);
                if (existing == null) 
                    throw new KeyNotFoundException($"Enseignant avec ID {id} introuvable.");

                // Marque pour suppression
                _Enseignant.Delete(existing);
                // Applique la suppression en base
                await _Enseignant.SaveChangesAsync();

                return existing;
            }

        public async Task<ENSEIGNANT?> GetENSEIGNANTByEmailAsync(string email)
        {
            return (ENSEIGNANT?)await _Enseignant.FindByEmailAsync(email);

        }
    }
}
