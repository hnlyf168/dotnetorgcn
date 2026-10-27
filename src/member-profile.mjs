export function profileHighlights({login,bio=''}){
  if(typeof bio!=='string'||!/^[-a-z0-9]+$/i.test(login||''))return [];
  const former=/\b(?:former|ex[- ]|aspiring|wannabe|candidate|hope to|want to|not an?)\b|曾任|前任|曾获|候选|希望成为/i.test(bio);
  const mvp=/(?:^|[,.|;\n]|\b(?:i am|i['’]m|an?|and))\s*(?:an?\s+)?Microsoft\s+(?:MVP|Most Valuable Professional)\b/i.test(bio)
    || /微软\s*(?:最有价值专家|MVP)/i.test(bio);
  return mvp&&!former?[{id:'microsoft-mvp',label:'Microsoft MVP',source:'github-profile',url:`https://github.com/${login}`}]:[];
}

export function rosterWithProfiles(roster,snapshot){
  return {...roster,members:roster.members.map(member=>{
    const cached=snapshot.members?.find(profile=>profile.login===member.login);
    if(!cached)return member;
    const githubBio=cached.githubBio||'';
    return {...member,name:cached.name||member.name,githubBio,highlights:profileHighlights({login:member.login,bio:githubBio}),profileUpdatedAt:cached.profileUpdatedAt||snapshot.generatedAt};
  })};
}
