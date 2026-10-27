export const repositoryOwner=(project,defaultOwner='hnlyf168')=>project.owner||defaultOwner;
export const repositoryUrl=(project,defaultOwner='hnlyf168')=>`https://github.com/${repositoryOwner(project,defaultOwner)}/${project.name}`;

export function applyRepositoryMetadata(project,repo,defaultOwner='hnlyf168') {
  const owner=repo.owner?.login;
  if(!owner||!/^[A-Za-z0-9-]+$/.test(owner))throw new Error(`Invalid repository owner for ${project.name}`);
  const before=repositoryUrl(project,defaultOwner);
  const after=`https://github.com/${owner}/${project.name}`;
  return {...project,owner,...(Number.isSafeInteger(repo.id)?{repositoryId:repo.id}:{}),stars:repo.stargazers_count,fork:repo.fork,...(project.command?{command:project.command.replace(before,after)}:{})};
}

export async function synchronizeProject(project,{defaultOwner='hnlyf168',headers={},fetcher=fetch}={}) {
  const url=Number.isSafeInteger(project.repositoryId)?`https://api.github.com/repositories/${project.repositoryId}`:`https://api.github.com/repos/${repositoryOwner(project,defaultOwner)}/${project.name}`;
  const response=await fetcher(url,{headers,redirect:'follow',signal:AbortSignal.timeout(20000)});
  if(response.status===404)return project;
  if(!response.ok)throw new Error(`GitHub API ${response.status}: ${project.name} metadata could not be synchronized.`);
  return applyRepositoryMetadata(project,await response.json(),defaultOwner);
}
