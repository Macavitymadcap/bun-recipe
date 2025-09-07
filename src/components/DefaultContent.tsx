
// Updated src/components/DefaultContent.tsx

import { RecipeStatistics } from "../database/services/recipe-service";

interface DefaultContentProps {
  statistics: RecipeStatistics;
}

export const DefaultContent = ({ statistics }: DefaultContentProps) => {
  return (
    <>
        <article className="card">
          <h2 className="card-header">Recipe Stats</h2>
          <div className="card-body text-center grid">
            <div className="col-6">
              <p>
                Total Recipes:&nbsp;
                <b className="text-primary">{statistics.totalRecipes}</b>
              </p>
            </div>
            <div className="col-6">
              <p>
                Unique Tags:&nbsp;
                <b className="text-secondary">{statistics.tagStatistics.length}</b>
              </p>
            </div>
          </div>
        </article>
          
        {statistics.tagStatistics.length > 0 && (
          <article className="card">
            <h3 className="card-header">
              Popular Tags
            </h3>
            <div className="card-body">
              <div className="wrapped-row">
                {statistics!.tagStatistics
                  .filter(tag => tag.count > 0)
                  .slice(0, 20) // Show top 20 tags
                  .map((tag, index) => (
                    <span key={index} className="badge badge-high mr-2 mb-1">
                      {tag.name} ({tag.count})
                    </span>
                  ))}
              </div>
              {statistics.tagStatistics.filter(tag => tag.count === 0).length > 0 && (
                <>
                  <h4 className="mt-3">Unused Tags:</h4>
                  <div className="wrapped-row">
                    {statistics.tagStatistics
                      .filter(tag => tag.count === 0)
                      .map((tag, index) => (
                        <span key={index} className="badge badge-low mr-2 mb-1">
                          {tag.name} (0)
                        </span>
                      ))}
                  </div>
                </>
              )}
            </div>
          </article>
        )}
    </>
  );
};