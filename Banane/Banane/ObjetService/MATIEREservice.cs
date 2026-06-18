
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class MATIEREservice
    {
        private readonly IRepositoryService<MATIERE> _Matiere;

        public MATIEREservice(IRepositoryService<MATIERE> Matieres)
        {
            _Matiere = Matieres;
        }

        public async Task<MATIERE> CreateMATIEREAsync(MATIERE newMatiere)
        {
            
            // Ajoute la matière au contexte EF
            await _Matiere.AddAsync(newMatiere);
            // Persiste les changements en base
            await _Matiere.SaveChangesAsync();

            return newMatiere;
        }

        public async Task<MATIERE?> GetMATIEREByIdAsync(int id)
        {
            return await _Matiere.GetByIdAsync(id);
        }

        public async Task<IEnumerable<MATIERE>> GetAllMATIEREAsync()
        {
            return await _Matiere.ListAsync();
        }

        public async Task UpdateMATIEREAsync(MATIERE Matiere)
        {
            // Indique à EF que l'entité a été modifiée
            _Matiere.Update(Matiere);
            // Persiste les modifications
            await _Matiere.SaveChangesAsync();
        }

        public async Task<MATIERE?> DeleteMATIEREAsync(int id)
        {
            var existing = await _Matiere.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Matière avec ID {id} introuvable.");

            // Marque pour suppression
            _Matiere.Delete(existing);
            // Applique la suppression en base
            await _Matiere.SaveChangesAsync();

            return existing;
        }
    }
}
