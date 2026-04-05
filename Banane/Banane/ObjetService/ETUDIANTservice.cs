using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class ETUDIANTservice
    {

        private readonly IRepositoryService<ETUDIANT> _Etudiant;
        private readonly IRepositoryService<UTILISATEUR> _Utilisateur;
        public ETUDIANTservice(IRepositoryService<ETUDIANT> Etudiants, IRepositoryService<UTILISATEUR> utilisateur)
        {
            _Etudiant = Etudiants;
            _Utilisateur = utilisateur;
       

        }

        //Verification s'il existe un UTILISATEUR avec les mêmes attributs
        public async Task<bool> ETUDIANTexistsAsync(ETUDIANT Utilisateur)
        {

            var existingUtilisateur = await _Etudiant.GetByConditionAsync(c =>
                c.Email == Utilisateur.Email);

            return existingUtilisateur.Any(); //RETOURN UN BOOL T ou F
        }
        public async Task<ETUDIANT> CreateETUDIANTAsync(ETUDIANT newUtilisateur)
        {
            if (await ETUDIANTexistsAsync(newUtilisateur))
            {
                throw new Exception($" Cet Email de :{newUtilisateur.Email}    existe déjà.");

            }
            // Ajoute le patient au contexte EF
            await _Etudiant.AddAsync(newUtilisateur);
            // Persiste les changements en base
            await _Etudiant.SaveChangesAsync();

            return newUtilisateur;
        }
        public async Task<ETUDIANT?> GetETUDIANTByIdAsync(int id)
        {
            return await _Etudiant.GetByIdAsync(id);
        }


        public async Task<IEnumerable<ETUDIANT>> GetAllETUDIANTAsync()
        {
            return await _Etudiant.ListAsync();
        }



        public async Task UpdateETUDIANTAsync(ETUDIANT Utilisateur)
        {
            // Indique à EF que l'entité a été modifiée
            _Etudiant.Update(Utilisateur);
            // Persiste les modifications
            await _Etudiant.SaveChangesAsync();
        }


        public async Task<ETUDIANT?> DeleteETUDIANTAsync(int id)
        {

            var existing = await _Etudiant.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Uilisateur avec ID {id} introuvable.");

            // Marque pour suppression
            _Etudiant.Delete(existing);
            // Applique la suppression en base
            await _Etudiant.SaveChangesAsync();
            return existing;
        }

        public async Task<ETUDIANT?> GetETUDIANTByEmailAsync(string email)
        {
            return (ETUDIANT?)await _Etudiant.FindByEmailAsync(email);

        }
    }
}
